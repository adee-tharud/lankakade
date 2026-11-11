# Storefront browsing and cart

Implemented on 2026-11-11 using the supplied grocery artwork and [Figma reference review](./10-storefront-ui-reference.md). The reference guides cream surfaces, green actions, typography, spacing, and responsive grids. Following the user’s screenshot feedback, the hero uses the artwork as a background with the shop action overlaid; the extra hero tagline is removed. Shared product cards use compact image areas, tighter spacing, smaller controls, and a 260 px maximum width. From the `sm` breakpoint, product grids use left-aligned 260 px columns with a 16 px gap so sparse rows do not spread cards across the container. Smaller screens retain the two-column layout and 12 px gap. The same grid styles apply to loading skeletons. Catalog content comes from the API; sample products are confined to tests.

## Routes and navigation

| Route | Behavior |
| --- | --- |
| `/` | Public Home for guests and customers: hero, categories, first four products, collection promo, and shopping information. The selection is not a popularity ranking. |
| `/shop` | Public grid with search, category, inclusive price bounds, reset, empty/loading/error states, and cursor pagination. Twelve items per page; filters/cursor live in the URL and Browser Back restores results. |
| `/products/:slug` | Gallery, description, SKU, actual variant choices, stock, RON price, quantity/add action, and up to four related products. Missing products have a recovery link. |
| `/cart` | Customer cart with server prices, quantity changes, removal, empty state, and subtotal. Delivery/final total await checkout. |

The responsive header includes Home, Shop, search, language, account, and cart count. Contact Us and About Us stay inactive because the user deferred both pages. Mobile menu and account dropdown support Escape and focus return. Guests see “Sign In / Register”; customers see their first name with account, addresses, and logout actions. Logout redirects to sign-in after server success or an expired-session response.

Authored UI copy uses the shared English/Romanian dictionary. Catalog names, descriptions, and option labels remain as supplied by the backend, which has no bilingual catalog fields. RON formatting follows the selected locale.

## Reusable components and state

- `Price` and `QuantityStepper` serve product and cart displays. Quantity respects stock and the 99-unit limit. Decreasing a quantity above current stock clamps to stock; zero-stock lines can be removed.
- `ProductImage`, `ProductCard`, `ProductGrid`, skeletons, and `CategoryTiles` are reused. All storefront layouts, pages, forms, notices, buttons, catalog controls, and cart styling use token-based Tailwind utilities. Global element defaults are in Tailwind’s base layer so utilities can override them. The old component and starter stylesheets have been removed; see [Tailwind hygiene](./04-design-system.md#tailwind-hygiene) for the shared styling rules. The hero’s inline background-image binding only supplies its imported asset URL. Category tiles use icons until photography is supplied. Missing/broken product images have an icon fallback.
- Feature services own typed, runtime-validated API boundaries. `useResource` cancels abandoned reads and supports retry. Query/slug changes remount results to prevent stale responses from replacing the current screen.
- Session remains in Redux. `CartProvider` keeps an in-memory server snapshot and is keyed by customer ID to isolate carts on logout, account change, and expiry. Language remains the only persisted UI preference.

## API and safety boundaries

Browse uses `GET /categories`, `GET /products`, and `GET /products/:slug`. Public summaries now include nullable `imageUrl` and `imageAltText` from the first image ordered by sort order and ID, avoiding a detail request for every card. MySQL's stock flag is converted numerically into a JSON boolean, including `false` for sold-out items. No migration or extra grants are needed.

Option selections match exact returned option-value IDs to a real variant. Missing combinations and sold-out variants cannot be added. Quick-add reads detail on demand: multiple variants lead to detail, while a single sellable variant can be added directly.

Guests receive the translated “You must sign in first.” notice before cart mutations. Its sign-in link preserves an allowlisted internal return path. After sign-in, adding remains an explicit action. There is no stored guest cart or merge.

Customer operations use `GET /cart`, `PUT /cart/items/:variantId` with exact quantity, and `DELETE /cart/items/:variantId`. Add first reads the latest cart and combines quantities. Writes are serialized in this browser and never retried automatically. Other tabs may change the cart concurrently; this does not provide atomic increments across tabs. Failure triggers a fresh read and sanitized feedback. Backend prices and stock remain authoritative; adding does not reserve inventory.

The shared client uses cookie sessions, configured API origin, bounded timeout, response validation, and existing server origin protections. Managed image paths use the validated API origin; external images require HTTPS without embedded credentials. Descriptions render as text. All colors use theme tokens. Credentials and cart data stay out of browser storage.

## Verification

Run `npm run build`, `npm run lint`, and `npm run test:browser` against isolated services. See the [auth verification setup](./11-auth-and-account.md#verification-and-repeatable-checks) for the temporary database and Postman preview.

Set `STOREFRONT_TEST_SEED_CATALOG=true` when starting the disposable backend harness for synthetic categories, 15 products, image bytes, and stocked/sold-out variants. The harness accepts only its temporary socket prefix and creates random test credentials. Never use a database holding real data. `STOREFRONT_TEST_REUSE_DATABASE=true` skips schema setup/seeding when restarting an initialized disposable instance.

Two storefront browser scenarios cover public Home, thumbnails, search, category/price filters, pagination/back, variants, sold-out actions, guest notification without writes, sign-in return, customer name, repeated adds, quantity/removal, reload persistence, logout, missing products, and desktop/mobile layouts. Four auth scenarios check regressions; four Postman failure scenarios check outages, rate limits, malformed responses, gateway failures, timeouts, and keyboard focus. All ten passed on 2026-11-11. All nine backend integration checks also passed with least-privilege roles, including thumbnails and sold-out flags. The Tailwind migration reran all ten browser scenarios and compared computed styles and element bounds with the saved pre-migration storefront at 320, 390, 680, 900, and 1440 px, covering public routes, signed-in account, address editing, dropdown, and cart layouts. The comparison caught and corrected a full-width address-field override. Backend integration checks were not rerun for this styling-only change.

Screenshots live under ignored `test-results/` and use synthetic products. These checks do not establish production SMTP, hosting, payment, or inventory accuracy.

Checkout/payment, Contact/About, catalog translation, category photos, custom sorting, and global result counts are outside this delivery. Pagination reports the current page count without inventing a global total.
