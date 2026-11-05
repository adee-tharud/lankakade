# Engineering Standards

## Code-quality rules

- TypeScript strictness is the default; avoid `any` unless a documented boundary requires it.
- Prefer simple, readable code over clever abstractions.
- Keep functions and components focused. Extract only when it improves readability, reuse, or testability.
- Make error paths first-class: loading, empty, unavailable, unauthorized, and failure states are part of every feature.
- Do not duplicate domain rules between UI, Redux, and API services.
- Comments explain decisions or constraints, not obvious syntax.

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
- Avoids exposing sensitive values.
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
