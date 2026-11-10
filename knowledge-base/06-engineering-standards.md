# Engineering Standards

## Code-quality rules

- TypeScript strictness is the default; avoid `any` unless a documented boundary requires it.
- Prefer simple, readable code over clever abstractions.
- Keep functions and components focused. Extract only when it improves readability, reuse, or testability.
- Make error paths first-class: loading, empty, unavailable, unauthorized, and failure states are part of every feature.
- Do not duplicate domain rules between UI, Redux, and API services.
- Comments explain decisions or constraints, not obvious syntax.

## Required coding checks

- [ ] **Colors use design tokens.** Never hardcode colors in components, inline styles, CSS rules, Tailwind utilities, or SVG fills and strokes. Raw palette values belong only in the central theme definitions. Use a semantic token for every color, including hover, focus, and error states. See the [design system](./04-design-system.md#design-token-policy).
- [ ] **Secrets stay on the server.** Never hardcode secret keys, credentials, tokens, signing secrets, or other sensitive values. Read secrets from server-side runtime configuration or a secret manager. Keep them out of Git, Vite client variables and bundles, browser storage, request URLs, logs, and analytics. Use placeholders in examples and synthetic data in tests.
- [ ] **Security is a release requirement.** Treat all client input as untrusted. Validate it at the server boundary, enforce authentication and resource ownership or role permissions for each protected operation, and deny access by default. Use parameterized queries, safe text rendering, and the API's session and origin protections. Review changed paths for injection, XSS, CSRF, and unauthorized access. Verify that malformed requests and unauthorized users fail safely. See the [security checklist](./05-security-and-otp.md#security-test-checklist).
- [ ] **API calls follow the contract.** Use the shared service layer and configured API origin. Send only the fields the endpoint accepts, include session credentials where required, and validate response data before use. Handle empty responses, expired sessions, forbidden access, rate limits, timeouts, and server errors without exposing private data. Retry writes only when the contract makes them safe. For checkout, reuse the same idempotency key and payload if the outcome is unknown. See the [backend API guide](./08-backend-api.md).

## Testing strategy

| Layer | Test intent |
| --- | --- |
| Unit | Pricing display, validation, selectors, reducers, formatters, and pure domain rules. |
| Component | Accessibility, variants, interactions, and visible UI states. |
| Integration | Feature workflows with mocked boundaries: cart updates, authentication states, checkout validation. |
| End-to-end | Critical user journeys: browse, add to cart, sign in, verify OTP, checkout, view an order. |
| Security | Authorization, input attacks, OTP abuse, session behavior, and checkout tampering. |

## Definition of done

A feature is complete only when it:

- Meets an agreed acceptance criterion.
- Uses the documented file structure and design system.
- Handles mobile, keyboard, loading, empty, error, and success states.
- Has appropriate automated coverage for its risk.
- Passes the required coding checks above.
- Updates this knowledge base if it introduces a reusable decision or workflow.
- Passes linting, type checking, build, and relevant tests.

## Pull-request review prompts

- Does this preserve layer boundaries and feature ownership?
- Is state stored at the correct scope?
- Are external data and permissions treated as untrusted?
- Is the component accessible and responsive?
- Can a failed or repeated request create a bad order/payment/account outcome?
- Are analytics/logs free of secrets and unnecessary personal data?

## Change-management rules

- Keep changes small and independently reviewable.
- Record migrations, API contract changes, and security-impacting decisions before release.
- Use feature flags for incomplete or risky customer-facing changes where appropriate.
- Never silently alter an order, payment, or account security workflow.
