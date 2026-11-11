# Storefront UI reference and component inventory

Reviewed the supplied `Untitled.fig` export on 2026-11-10 using its canvas preview and layer tree. The reference includes a UI library, ten desktop and mobile screen pairs, and 21 feedback scenarios shown at both sizes. Use it as the visual direction for LankaKade. The reference dimensions, sample products, and demo workflows are illustrative.

## Visual direction

- Keep the warm grocery feel with white and soft cream surfaces, a deep green announcement strip and footer, and brighter green for primary actions. Use muted greens for supporting elements and distinct error and success treatments. Map these roles to the central theme in the [design system](./04-design-system.md#design-token-policy).
- Use Plus Jakarta Sans as the reference typeface. Keep the strong headlines, compact category labels, clear price hierarchy, softly rounded cards, and generous spacing. The supplied brand artwork includes Sinhala lettering. Preserve that lettering in approved artwork and keep important page text and actions accessible as HTML.
- Let food photography carry the home hero, category tiles, product cards, and collection promo. Give product images a consistent aspect ratio, and define useful alt text and a fallback for missing images. Keep the hero artwork legible on narrow screens.
- The reference uses a wide desktop header with links and search. The compact header keeps the brand, menu, account, cart, and search accessible. Catalog cards form a compact two-column grid on the mobile reference. Checkout, account, and contact panels stack on smaller screens. Treat the 1440 px and 390 px frames as reference points and design for widths between and beyond them.
- Support Romanian and English copy through the reusable header language selector. Keep RON as the currency in both languages per the [commerce guide](./07-romania-commerce.md).

## Shared primitives and layout

| Component | Use and variants |
| --- | --- |
| `Button` and `IconButton` | Filled primary, outlined secondary, and quiet actions. Support leading or trailing icons, full-width forms, and disabled and submitting states. Use accessible names on icon-only actions such as search, add, menu, remove, and password visibility. Use a link styled as a button for navigation. |
| `FormField` | Label, control, help text, and inline validation. Compose text, email, phone, password with visibility toggle, textarea, select, checkbox, and radio controls. Reuse across authentication, filters, contact, checkout, and account forms. |
| `Badge` and `CountBadge` | Stock availability, verified email, order status, and cart count. Use text with color for status. Keep the cart count badge separate from the cart's accessible label. |
| `QuantityStepper` | Minus, current quantity, plus, and an optional limit message. Shared by product detail and cart rows. Support minimum, available-stock and cart limits, and pending updates. |
| `Price` and `SummaryRow` | Reuse RON formatting for product, cart, checkout, and order values. Distinguish a starting price, a confirmed amount, and delivery awaiting calculation. Keep decimal strings at the API boundary. |
| `Notice`, `EmptyState`, and skeletons | Inline success, warning, or error notice. Empty state with heading, explanation, and optional recovery action. Product card and list skeletons should match their loaded layout. |
| `StorefrontLayout`, `SiteHeader`, and `SiteFooter` | Shared shell with announcement strip, brand mark, nav links, search, account and cart controls, and locale display. Footer contains brand, grouped links, and store contact details. Keep navigation data shared between layouts. |
| `Breadcrumbs`, `PageHeading`, and `SectionHeading` | Reuse for catalog, cart, checkout, account, about, and contact pages. Sections can include an eyebrow, description, or trailing link where the design calls for one. |
| `Drawer` or `Dialog` | Reusable accessible overlay foundation for the mobile menu, filter panel, and address editor when an overlay is appropriate. Define focus return, keyboard dismissal, and an explicit close action. |

## Catalog and home components

The Figma library already defines primary and secondary buttons, a default input, a quantity control, desktop and mobile navigation, and six sample product cards at each size. In the storefront, use one responsive `ProductCard` with data and layout variants across home, shop, and related products.

| Component | Composition and ownership |
| --- | --- |
| `ProductCard` and `ProductGrid` | Card contains image, category label, title link, optional pack or variant metadata, RON price, and a separate cart action. Grid owns column count and spacing. Card handles missing images, sold-out items, pending actions, and a choose-options action when a specific variant needs selection. Keep catalog and cart rules in their feature modules. |
| `CategoryTile` and `CategoryGrid` | Category image, readable name, and link to the shop filtered by that category. One tile design for all categories. |
| `HeroBanner` | Supplied hero artwork with a separate shop action and accessible heading or text alternative. Keep it in the home feature. |
| `FeaturedProductsSection` | Section heading, optional shop link, and the same `ProductGrid`. The home reference calls it Pantry favourites. |
| `CollectionPromo` and `ShoppingAssuranceList` | The collection promo combines an eyebrow, heading, description, image, and action. Assurance items repeat an icon, short title, and supporting line. Claims depend on the services actually available. |
| `CatalogSearch`, `FilterControls`, and `ResultsToolbar` | Search, category and price fields, reset, result information, and sorting if supported. Share filter values and controls across the desktop sidebar and compact mobile panel. |
| `ProductMedia`, `ProductPurchasePanel`, and `ProductDetailsSection` | Product image or gallery, category and product information, stock badge, price, option selection, quantity and add-to-cart. Keep descriptive details separate and reuse the card grid for any related items. Resolve option choices to an actual variant before adding. |

## Shopping, account, and content components

| Screen or workflow | Components to extract |
| --- | --- |
| Cart | `CartItemRow` with product link, image, option or pack details, price, quantity stepper, remove action, and line feedback. `OrderSummary` shows subtotal, delivery when known, total, and the next action. Reuse the summary layout at checkout and adapt its rows to the data available. |
| Checkout | `CheckoutProgress`, `ContactFields`, `AddressForm`, `SavedAddressPicker`, `DeliveryOption`, `OrderSummary`, and an order action with clear validation and pending feedback. Let the checkout feature own the steps and preview state. |
| Sign-in, registration, and recovery | `AuthLayout` for the optional desktop story panel and shared form area. Compose `SignInForm`, `RegisterForm`, `PasswordResetForm`, and `VerificationPanel` from shared fields, notices, and buttons. |
| My account | `AccountNavigation`, `ProfileForm`, `AddressCard`, and `AddressEditor`. Share address fields with checkout where their purpose matches. Keep edit and remove actions explicit. |
| My orders | `OrderCard`, `OrderStatusBadge`, `OrderDetail`, and a `StatusTimeline` when real transition data is available. Reuse RON formatting and summary rows. |
| About and contact | `StoreInfo` for address and verified contact details, an image-and-text introduction, `ContactForm`, and `MapPanel` when configured. The introduction can stay local to About. Reuse `StoreInfo` in the footer and contact page. |

Share components that repeat or have a common interaction. Keep page-specific copy, one-off editorial arrangements, and feature workflows with their pages or features. Use the [file structure guide](./02-file-structure.md) to place shared primitives, storefront layouts, and domain components.

## Feedback states to carry forward

| Area | States covered by the reference |
| --- | --- |
| Authentication | Verify-email prompt and resend feedback, expired link, forgot password with a generic confirmation, reset validation, password updated, invalid sign-in, and submitting. |
| Catalog and cart | Product skeletons, no matching results with a filter reset path, empty cart, changed availability, and quantity limits. Also define missing-image and load failure states when implementing. |
| Checkout and orders | Address validation, no orders yet, payment handoff, payment confirmed or failed, and transaction-email feedback. Payment and order confirmations must reflect server state. |
| Account, contact, and navigation | Address editor validation, contact field errors and submission outcomes, mobile menu, and mobile filters. |

Use visible focus, keyboard support, and readable touch targets for compact controls. Announce meaningful loading, cart, and form changes. Check contrast and text wrapping with real Romanian labels, long product names, and prices.

## Reference features that need product or API decisions

The reference includes demo prices, pickup, Stripe, sample order history, and a map placeholder. The bilingual header selector is implemented. Confirm content and service support before presenting them as live. The [backend API guide](./08-backend-api.md) is the source for integration details.

- **Catalog cards and filters.** Product lists provide `priceFrom` and `inStock` but omit images and variants. Plan a list payload or an approved fallback for photo-led cards. Category photos also need an asset source. Use a real variant ID for cart actions. The API supports name or slug search, category, and price filters. Brand, in-stock filtering, custom sort order, and a global result count need contract decisions.
- **Cart and delivery.** Server carts require a signed-in customer, and checkout preview uses an owned Romanian address and a configured flat fee. Guest checkout, saved-address defaults, and store pickup are separate decisions. Show only eligible options and server-calculated fees.
- **Payments and orders.** Order creation is local test mode only. Production payment handoff, order history and tracking, and order email resend need backend support. The existing customer endpoint reads an owned order by ID.
- **Account and content.** The current login contract has no remember-me option. Contact submission and a live map need approved integrations. Confirm store details before using the reference copy.
