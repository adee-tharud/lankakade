# Backend API

LankaKade's storefront and admin panel share a Node.js 24+ API built with Express. The storefront calls `/api/v1` through its service layer. The backend owns customer identity, permissions, current prices, inventory, delivery fees, and order state. Routes validate requests, services enforce business rules, and repositories query MySQL using `mysql2`. See the [API entry point](../../backend/src/app.js), [backend knowledge base](../../backend/knowledge-base/README.md), and [database overview](./09-database.md).

This guide describes the routes in the backend working tree as of 2026-11-10. The route handlers and repositories are the reference for exact behavior. The [Postman collection](../../backend/postman/LankaKade.postman_collection.json) contains runnable examples, and the [backend integration suite](../../backend/tests/integration/auth-accounts.test.js) covers HTTP and database behavior against a disposable MySQL instance.

## Local setup and browser requests

1. Set up MySQL with the [schema, migrations, and runtime roles](./09-database.md#local-database-setup).
2. In `backend`, install dependencies with `npm ci`. Use [.env.example](../../backend/.env.example) and the [auth setup guide](../../backend/knowledge-base/auth-and-accounts.md#local-setup) to configure the API login, independent server keys, browser origins, and a local SMTP sink. Keep these credentials and keys on the server.
3. Run `npm start` from `backend`. The default API base is `http://localhost:3000/api/v1`. `GET /health` returns `200 { "status": "ok" }` and confirms the process is serving HTTP. It performs no database query on each request.
4. Start the storefront dev server on `http://localhost:5173` and use `http://localhost:5174` for the admin panel, matching `STOREFRONT_ORIGIN` and `ADMIN_ORIGIN`. Keep `localhost` consistent across browser URLs. If Vite uses a different port, update the backend origin or use the configured port. In production, serve the apps and API on HTTPS origins on the same site so the session cookie can be sent.

Keep the API origin in frontend environment configuration. Route paths in the tables below are relative to `/api/v1`. API paths are case sensitive and use no trailing slash.

- Use `credentials: 'include'` for sign-in and requests that use the session. The API sets an HttpOnly, `SameSite=Lax` cookie named `lankakade_session` locally and a `Secure` `__Host-lankakade_session` cookie in production. Restore the signed-in profile with `GET /account` on startup.
- Writes require an allowed browser `Origin`. Cart, checkout, and order routes allow CORS only for the storefront origin and require a customer session. Admin sessions require the exact admin origin on authenticated reads and writes. Let the browser set `Origin` and send the cookie.
- Send `Content-Type: application/json` on JSON writes. JSON bodies have an 8 KiB limit and reject unknown fields. Admin product image uploads also accept multipart. Handle `202` and `204` responses with an empty body.
- Keep IDs, cursors, cart revisions, and RON amounts as strings. Quantities and stock counts are integers. The backend uses UTC timestamps. Format currency and dates at the UI boundary.

## Public catalog

| Method and path | Input | Result |
| --- | --- | --- |
| `GET /categories` | Optional `q`, `after`, `limit` | `200 { categories, nextCursor }`. Category rows include `id`, `name`, `slug`, and `description`. |
| `GET /products` | Optional `q`, `category` (slug), `minPrice`, `maxPrice`, `after`, `limit` | `200 { products, nextCursor }`. Each row has `id`, `categoryId`, `categorySlug`, `name`, `slug`, `priceFrom`, `inStock`, `imageUrl`, and `imageAltText`. |
| `GET /products/:slug` | Product slug | `200 { product }` with description, images, options, and variants. Returns `404` when the product is missing or hidden. |
| `GET /product-images/:key` | Managed image key from a product's image URL | `200` with `image/webp` bytes, or `404`. |

Lists are in ascending ID order. `limit` defaults to 20 and accepts 1–50. Use the returned `nextCursor` as `after` with the same filters. `null` marks the final page. Search `q` matches part of a name or slug and accepts up to 100 characters. Price filters are inclusive decimal amounts and must match the same active variant. `priceFrom` is the lowest price across all active variants even when a filter matched a different one.

Products appear when their category and product are active and at least one variant is active. Active sold-out variants remain visible. On product detail, match selected option value IDs to a returned variant's `optionValueIds`. Use its `id`, `sku`, `price`, `availableStock`, and `availability` (`in_stock` or `sold_out`). Products without options use a single default variant with an empty `optionValueIds` list. Product list rows include the first ordered image as nullable `imageUrl` and `imageAltText`; they omit variant details. A card can render without a photo and loads detail before choosing a real variant for a cart write. On detail, image URLs may be absolute HTTPS URLs or API-relative paths such as `/api/v1/product-images/<key>`. Resolve relative paths against the API origin. See the [catalog contract](../../backend/knowledge-base/product-catalog.md#storefront-api).

## Authentication and account

| Method and path | Input and result |
| --- | --- |
| `POST /auth/register` | Send `email`, `fullName`, `password`. Returns `202` and schedules verification when eligible. Creates customer accounts. |
| `POST /auth/send-verification` | Send `email`. Returns `202` and schedules verification when eligible. |
| `POST /auth/verify-email` | Send `token` from the email link. Returns `204`. |
| `POST /auth/login` | Send `email`, `password`. Admin sign-in also uses `mfaCode` and the admin origin. Returns `200 { user: { id, role } }` and sets the cookie. |
| `POST /auth/logout` | Send the current session cookie. Revokes the session, clears the cookie, and returns `204`. |
| `POST /auth/forgot-password` | Send `email`. Returns a generic `202` and schedules a reset link when eligible. |
| `POST /auth/reset-password` | Send `token` and new `password`. Returns `204` and invalidates previous sessions. |
| `GET /account` | Returns `200 { user }` with `id`, `email`, `fullName`, `phone`, `role`, `emailVerifiedAt`, and `createdAt`. |
| `PATCH /account` | Send `fullName`, `phone`, or both. `phone: null` clears the number. Returns `200 { user }`. |
| `GET /account/addresses` | Returns `200 { addresses }` for the signed-in user. |
| `POST /account/addresses` | Send a delivery address. Returns `201 { address }`. The account limit is 20 addresses. |
| `PUT /account/addresses/:id` | Send a full replacement for an owned address. Returns `200 { address }`. |
| `DELETE /account/addresses/:id` | Removes an owned address and returns `204`. |

Address fields are `recipientName`, `recipientPhone`, `addressLine1`, `locality`, `region`, and `postalCode`. `label` and `addressLine2` are optional. `countryCode` defaults to `RO` and takes a two-letter code. An unknown or unowned address returns `404`. Checkout separately checks delivery eligibility.

Customer login requires a verified email and issues a session for seven days. Admin sessions last eight hours and require an authenticator or recovery code. A customer uses one-time email links for verification and password reset. The storefront needs routes for `/verify-email#token=…` and `/reset-password#token=…`. Read the fragment, remove it from browser history, and send the token in the appropriate JSON request. Verification links last 24 hours and reset links last 20 minutes. Treat `202` as an accepted request and offer resend or reset recovery if the email never arrives. See the [auth contract](../../backend/knowledge-base/auth-and-accounts.md#api-contract).

## Cart, delivery preview, and orders

These routes require a customer session. There is no server guest cart or merge endpoint. The cart holds requested quantities and shows current stock and prices. Checkout is the first step that reserves stock.

| Method and path | Input and result |
| --- | --- |
| `GET /cart` | `200 { cart: { revision, currency, items } }`. An empty, new cart starts at revision `"0"`. |
| `PUT /cart/items/:variantId` | `{ "quantity": 2 }` sets the exact quantity. Accepts 1–99 per line and up to 50 distinct variants. Returns `200 { cart }`. |
| `DELETE /cart/items/:variantId` | Removes the line and returns `200 { cart }`. Repeating a removal or setting the same quantity leaves the revision unchanged. |
| `POST /checkout/preview` | `{ "addressId": "1" }` returns `200 { checkout }` with `addressId`, `cartRevision`, `currency`, `subtotal`, `deliveryFee`, and `total`. Requires an owned `RO` address and a configured flat fee. |
| `POST /checkout` | **Local test mode only.** Send `addressId`, `cartRevision`, `expectedTotal`, and `checkoutKey`. First success returns `201 { order }` and `Location`. An identical replay returns `200` with the same order in its current state. |
| `GET /orders/:id` | Returns `200 { order }` only to its owner. Includes `id`, `orderNumber`, `status`, `fulfillmentStatus`, `currency`, totals, `createdAt`, `reservationExpiresAt`, and `items`. |

Cart lines include `variantId`, `productName`, `productSlug`, `sku`, `quantity`, `unitPrice`, `availableStock`, and `availability`. Sold-out and archived lines remain visible and removable. Archived or otherwise hidden lines use `unavailable`, zero available stock, and a null `unitPrice`. Order items use saved product names, SKUs, option labels and values, unit prices, quantities, and line totals.

For local checkout, use the returned preview revision and total verbatim, along with a new random key such as a UUID. This example assumes the preview returned address `1`, revision `3`, and total `35.50` RON.

```json
{
  "addressId": "1",
  "cartRevision": "3",
  "expectedTotal": "35.50",
  "checkoutKey": "4e7f66b9-f03f-45e3-82cb-2d1576128ed8"
}
```

Reuse the identical key and body if the outcome is unknown after a timeout. After expiry or after the customer changes the request, preview again and use a new key. Checkout revalidates the cart, address, stock, and total in a transaction. An account can have one order awaiting payment at a time, and a confirmed order prevents another checkout from the same cart revision. The expiry worker releases stock after the 15-minute reservation expires. Use `order.id` from the response body to open order details, since the API does not expose the `Location` header to cross-origin browser code. See [cart and checkout setup](../../backend/knowledge-base/cart-and-checkout.md#database-setup).

## Admin routes

These routes require an MFA-authenticated admin session and the admin origin. They are used by the separate admin panel and determine the data visible in the public catalog.

| Path | Methods and behavior |
| --- | --- |
| `/admin/users` | `GET` lists users, up to 50 at a time. Pass `nextCursor` as `after`. |
| `/admin/categories` | `GET` lists categories including archived ones. `POST` creates a category. |
| `/admin/categories/:id` | `GET` reads, `PATCH` edits, `DELETE` archives. |
| `/admin/products` | `GET` lists products including archived ones and can filter by `categoryId`. `POST` creates a product. |
| `/admin/products/:id` | `GET` reads details, `PATCH` edits, `DELETE` archives. |
| `/admin/products/:id/restore` | `POST` restores a product. |
| `/admin/products/:id/variants` | `POST` creates a variant with a SKU, price, and optional opening stock. |
| `/admin/products/:id/variants/:variantId` | `GET` reads, `PATCH` edits price or low-stock threshold, `DELETE` archives. |
| `/admin/products/:id/variants/:variantId/restore` | `POST` restores a variant. |

Category, product, and variant creates return `201` with `Location`; archives and restores return `204`. Product creation and edits support managed images uploaded as multipart. Archiving a category hides its products from public views. Restoring a product preserves its variant states. See the [admin catalog contract](../../backend/knowledge-base/product-catalog.md#admin-api) for field limits, uploads, and archive behavior.

## Errors and retries

Errors have the shape `{ "error": "CODE", "message": "..." }` with optional `field` and `details`. Branch on HTTP status and the machine-readable `error` code. If a shopper requests two units and only one remains, the cart update can return this `409` response.

```json
{
  "error": "CART_STOCK_CHANGED",
  "message": "Review the availability of these items and try again.",
  "details": { "items": [{ "variantId": "42", "availableStock": 1 }] }
}
```

| Status and code | Storefront handling |
| --- | --- |
| `400 INVALID_INPUT` | Show the validation issue next to `field` when supplied. For `INVALID_OR_EXPIRED_TOKEN`, offer a new email link. |
| `401 AUTHENTICATION_REQUIRED` | Clear stale signed-in state and offer sign-in. `INVALID_CREDENTIALS` is the generic login failure. |
| `403 ORIGIN_NOT_ALLOWED`, `CUSTOMER_REQUIRED`, or `ADMIN_REQUIRED` | Check origin configuration or the active account role. |
| `404 NOT_FOUND` | Show an unavailable product or order, or refresh saved addresses. Missing and unowned records use the same response. |
| `409 CART_STOCK_CHANGED` | Let the shopper reduce or remove lines using `details.items`. |
| `409 CART_CHANGED` or `CHECKOUT_TOTAL_CHANGED` | Refresh the cart and preview again. Show changed totals from `details` and ask the shopper to confirm. |
| `409 CHECKOUT_IN_PROGRESS` or `CHECKOUT_KEY_REUSED` | Load `details.orderId` for an existing checkout. Use a fresh key for a different request. |
| `409 CART_EMPTY`, `CART_LIMIT`, or `DELIVERY_UNAVAILABLE` | Let the shopper correct the cart or choose an eligible address. |
| `429 RATE_LIMITED` | Show a wait-and-retry message. The API sends `Retry-After`, which is currently unavailable to cross-origin browser code. |
| `503 CHECKOUT_UNAVAILABLE` or `SERVICE_UNAVAILABLE` | Preserve the cart and show the unavailable state. For an interrupted local checkout, retry the same payload and key. |

## Integration boundaries

Production order creation returns `503 CHECKOUT_UNAVAILABLE`. The payment provider adapter, signed webhook route, reconciliation and refunds still need integration. The backend has internal logic for applying an already verified payment and a working reservation expiry worker. Catalog and checkout transactions queue low-stock email jobs, while the low-stock email sender remains a placeholder.

Customer order history, tracking, cancellation and returns, admin order fulfillment, inventory adjustments, and sales reporting have no registered endpoints. The schema and backend system flows describe those domains for future work. See [database coverage](./09-database.md#schema-map) and the [backend system flows](../../backend/knowledge-base/system-flows.md).
