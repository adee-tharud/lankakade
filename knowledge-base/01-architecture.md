# Architecture

## Goal

Build a responsive, accessible storefront whose user interface, business rules, and external integrations remain independently understandable and replaceable.

## Technology decisions

| Area | Decision | Rule |
| --- | --- | --- |
| UI | React + TypeScript | Components are typed and focused on one responsibility. |
| Styling | Tailwind CSS | Use approved design tokens and reusable primitives; avoid one-off visual values. |
| Client state | Redux Toolkit | Use for shared client state and workflows, not every component value. |
| API access | Dedicated service layer | UI components never call endpoints directly. |
| Backend | Node.js 24+ and Express, with MySQL 8.4+ | Both storefront and admin use `/api/v1`. See [Backend API](./08-backend-api.md) and [Database overview](./09-database.md). |
| Authentication | Server-side sessions with HttpOnly cookies | The browser sends credentials and the API checks the current account and request origin. |
| Forms | Feature-owned form layer | Validate immediately for usability and always validate again on the server. |
| Routing | Route modules | Pages compose features; they do not contain domain logic. |

## Layer boundaries

```text
Page / route
  -> feature module
    -> UI components + feature hooks
      -> Redux slice / API service
        -> backend or approved third-party service
```

- Pages coordinate a screen and route parameters.
- Features own business workflows, such as cart, catalog, authentication, checkout, and orders.
- Shared UI is presentation-only and does not know product or order rules.
- API services handle request construction, authentication, response mapping, and consistent errors.
- The backend remains the authority for pricing, inventory, discounts, permissions, payments, and order status.

## Core domains

| Domain | Responsibilities |
| --- | --- |
| Catalog | Categories, search, filters, product details, availability presentation. |
| Cart | Local cart interaction, optimistic UX where safe, server reconciliation. |
| Authentication | Session awareness, registration, sign-in, password recovery, OTP challenge flow. |
| Checkout | Address, delivery, payment initiation, final confirmation. |
| Orders | Order history, order detail, status tracking, cancellation/return requests. |
| Account | Profile, addresses, preferences, security settings. |
| Admin | Separate protected experience with least-privilege permissions. |

## Non-negotiable rules

- Never trust prices, stock, role claims, discounts, or OTP verification performed only in the browser.
- Keep payment card data outside the application whenever possible by using a compliant payment provider's hosted/tokenized flow.
- Treat each external provider as an integration behind an adapter, so it can be changed without rewriting checkout.
- Put environment-specific values in configuration, never in source code.
- Add observability for checkout failures, authentication anomalies, and order-state transitions without logging sensitive data.

## Decisions still needed

- Payment and Romanian courier providers.
- Tax/invoicing service and return-policy workflow.
- Content and localization.
