# State Management

## Ownership model

Choose the smallest scope that can safely own a value.

| State type | Preferred owner | Examples |
| --- | --- | --- |
| Ephemeral UI state | Component | Open menu, hovered card, uncontrolled visual toggle. |
| Screen/form state | Page or feature | Search draft, delivery-form progress, validation display. |
| Shared client state | Redux Toolkit or a focused provider | Authenticated user summary; cart provider keyed to the current customer; language provider. |
| Server state | Feature services and abortable resource hooks | Products, inventory, cart, order details, addresses. |
| Persistent sensitive state | Server only | Passwords, raw OTPs, payment information, authorization decisions. |

## Redux Toolkit rules

- Use slices around domains: `auth`, `cart`, `checkout`, `catalog`, and `ui`; do not create slices per component.
- Keep reducers deterministic and serializable.
- Use selectors as the public way to read state. Components should not depend on a slice's internal shape.
- Centralize side effects in async workflows, middleware/listeners, or the API layer; reducers do not make network calls.
- Model request status explicitly: idle, loading, succeeded, failed. Show actionable errors and provide retry paths when appropriate.
- Reset or invalidate state deliberately on logout, account change, order completion, and expired sessions.

## Cart policy

- Guests can browse but cannot create or mutate a cart. Show the translated “You must sign in first.” notice with a sign-in link. No guest cart is persisted or merged.
- Keep the server cart snapshot in memory in `CartProvider`, keyed by customer ID. Remount it on logout, expiry, or account change. Never save cart contents in browser storage.
- Read the latest server cart before an add, then submit the exact new quantity. Serialize writes and refresh the authoritative cart after a failed mutation. Never automatically replay a write after a timeout.
- The server recalculates product price, discount, tax, availability, and delivery eligibility at checkout.
- Never treat a browser-stored cart total as authoritative.

## Checkout policy

- Keep only the minimal necessary checkout draft in client state.
- Do not persist raw payment details in Redux, browser storage, logs, analytics, or error reports.
- Make order placement idempotent using a server-provided idempotency mechanism, preventing duplicate orders after refreshes or retries.

## State review checklist

- Is this value shared beyond one component?
- Is Redux genuinely needed, or is local state clearer?
- Is any value sensitive, server-authoritative, or too stale to persist?
- What invalidates this data?
- Does this flow handle loading, empty, error, and retry states?
