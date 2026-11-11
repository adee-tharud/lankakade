// Failure-only local fixture derived from the sibling API's auth contract.
// Synthetic email values select injected failures. No successful auth is modeled.
const http = require('node:http')

http
  .createServer((req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Content-Type', 'application/json')
    if (req.method === 'GET' && path === '/api/v1/account') {
      res.writeHead(503)
      return res.end(
        JSON.stringify({
          error: 'SERVICE_UNAVAILABLE',
          message: 'Service unavailable',
        }),
      )
    }
    if (req.method === 'POST' && path === '/api/v1/auth/login') {
      const email = req.body?.email
      if (email === 'rate-limit@example.test') {
        res.writeHead(429, { 'Retry-After': '30' })
        return res.end(
          JSON.stringify({
            error: 'RATE_LIMITED',
            message: 'Too many attempts',
          }),
        )
      }
      if (email === 'malformed@example.test') {
        res.writeHead(200)
        return res.end(JSON.stringify({ user: { role: 'admin' } }))
      }
      if (email === 'timeout@example.test') {
        return setTimeout(() => {
          res.writeHead(503)
          res.end(
            JSON.stringify({
              error: 'SERVICE_UNAVAILABLE',
              message: 'Service unavailable',
            }),
          )
        }, 13000)
      }
      res.writeHead(502, { 'Content-Type': 'text/html' })
      return res.end('<h1>Gateway unavailable</h1>')
    }
    res.writeHead(501)
    res.end(JSON.stringify({ error: 'NOT_MODELED' }))
  })
  .listen(process.env.PORT || 4010)
