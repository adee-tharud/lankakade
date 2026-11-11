// Local browser-test harness. Starts the real sibling API with a disposable database
// and captures email links in memory instead of sending messages.
import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { randomBytes } from 'node:crypto'
import { createApp } from '../../../backend/src/app.js'
import { createPool } from '../../../backend/src/db/pool.js'

const socketPath = process.env.STOREFRONT_TEST_DB_SOCKET
if (!socketPath?.startsWith('/private/tmp/lankakade-storefront-')) {
  throw new Error('A dedicated temporary storefront MySQL socket is required')
}
const require = createRequire(
  new URL('../../../backend/package.json', import.meta.url),
)
const mysql = require('mysql2/promise')
const owner = await mysql.createConnection({
  socketPath,
  user: 'root',
  multipleStatements: true,
})
for (const path of [
  'database/schema.sql',
  'database/migrations/001_auth_and_accounts.sql',
  'database/migrations/002_product_image_files.sql',
  'database/migrations/003_checkout_lookup.sql',
  'database/permissions/auth_runtime.sql',
  'database/permissions/catalog_runtime.sql',
  'database/permissions/orders_runtime.sql',
]) {
  await owner.query(
    await readFile(
      new URL(`../../../backend/${path}`, import.meta.url),
      'utf8',
    ),
  )
}
const password = randomBytes(32).toString('hex')
await owner.query(
  "CREATE USER 'storefront_browser_test'@'localhost' IDENTIFIED BY ?",
  [password],
)
await owner.query(
  "GRANT 'lankakade_auth_runtime', 'lankakade_catalog_runtime', 'lankakade_orders_runtime' TO 'storefront_browser_test'@'localhost'",
)
await owner.query(
  "SET DEFAULT ROLE ALL TO 'storefront_browser_test'@'localhost'",
)
const pool = createPool({
  socketPath,
  database: 'lankakade',
  user: 'storefront_browser_test',
  password,
})
const emails = new Map()
const storefront = process.env.STOREFRONT_TEST_ORIGIN || 'http://localhost:5173'
const apiPort = Number(process.env.STOREFRONT_TEST_API_PORT || 3000)
const config = {
  production: false,
  trustedProxies: [],
  storefront,
  admin: 'http://localhost:5174',
  origins: new Set([storefront, 'http://localhost:5174']),
  mfaKey: randomBytes(32),
  rateLimitKey: randomBytes(32),
}
const app = await createApp({
  config,
  pool,
  mail: {
    sendAuthLink: async (message) =>
      emails.set(`${message.email}:${message.purpose}`, message.link),
  },
})
const api = app.listen(apiPort, '127.0.0.1', () =>
  console.log('Temporary real API ready on port', apiPort),
)
const controls = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:4101')
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  if (url.pathname === '/email') {
    res.end(
      JSON.stringify({
        link:
          emails.get(
            `${url.searchParams.get('email')}:${url.searchParams.get('purpose')}`,
          ) ?? null,
      }),
    )
  } else if (req.method === 'POST' && url.pathname === '/expire-sessions') {
    await owner.query(
      'UPDATE lankakade.auth_sessions SET revoked_at = CURRENT_TIMESTAMP(6)',
    )
    res.end('{}')
  } else {
    res.statusCode = 404
    res.end('{}')
  }
}).listen(4101, '127.0.0.1')
async function shutdown() {
  api.close()
  controls.close()
  await pool.end()
  await owner.end()
}
process.once('SIGTERM', shutdown)
process.once('SIGINT', shutdown)
