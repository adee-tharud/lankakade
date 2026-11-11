# LankaKade storefront

React, TypeScript, Vite, Tailwind, and Redux storefront for Sri Lankan groceries in Romania. Includes public Home, Shop, product details, English/Romanian UI, authentication, profile/addresses, and a signed-in server cart. Contact and About pages are deferred.

## Local development

1. Run `npm ci`.
2. Configure and start the sibling backend using its [local setup](../backend/knowledge-base/auth-and-accounts.md#local-setup).
3. Run `npm run dev`; open `http://localhost:5173`. Vite proxies `/api` to port 3000. See [.env.example](./.env.example) for API configuration.

## Checks

```sh
npm run build
npm run lint
npm run test:browser
```

Browser tests require isolated API, database, and failure-simulation services. Follow [verification setup](./knowledge-base/11-auth-and-account.md#verification-and-repeatable-checks) and [catalog fixture setup](./knowledge-base/12-storefront-browsing.md#verification). `test:e2e`, `test:storefront`, and `test:api-failures` select individual suites.

Read the [knowledge base](./knowledge-base/README.md) before making changes. Colors belong in `src/styles/theme.css`; secrets belong in server configuration. Production requires HTTPS, API routing, and SPA fallback.
