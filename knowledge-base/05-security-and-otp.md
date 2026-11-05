# Security and OTP

## Security model

The browser is an untrusted client. Every authorization, price, inventory, discount, OTP verification, and order transition must be validated by the backend.

## Baseline controls

| Area | Requirement |
| --- | --- |
| Transport | Use HTTPS everywhere; enable secure headers and a restrictive content-security policy. |
| Sessions | Prefer secure, `HttpOnly`, `Secure`, appropriately scoped cookies. Protect state-changing requests against CSRF. |
| Authorization | Enforce permissions on every backend endpoint; hide admin UI as a convenience, never as protection. |
| Input | Validate and normalize all input server-side; use allow-lists where possible. |
| Output | Encode rendered data and avoid unsafe HTML injection to prevent XSS. |
| Secrets | Keep keys and credentials outside source control and browser bundles. Rotate on exposure. |
| Dependencies | Lock dependencies, review updates, and scan for known vulnerabilities. |
| Logging | Record security-relevant events without passwords, OTPs, tokens, payment data, or unnecessary personal data. |
| Rate limits | Apply limits by account, device/session, IP, and endpoint risk; return non-enumerating responses. |

## OTP requirements

Use OTP only for a defined purpose: email/phone verification, password recovery, sign-in verification, or high-risk account action. Each purpose should have separate rules and audit events.

- Generate OTPs with a cryptographically secure server-side generator.
- Store only a protected/hashed representation where feasible; never store or log the plain code.
- Bind the challenge to its recipient, purpose, session/context, and creation time.
- Make codes short-lived (typically minutes), single-use, and invalid after successful verification.
- Limit verification attempts and resend attempts. Add progressive delays, rate limits, and temporary lockouts for abuse.
- Invalidate older codes when a new code is issued, unless a deliberately documented alternative exists.
- Do not reveal whether an email, phone number, account, or OTP exists. Use generic customer-facing messages.
- Require a recent verified step for sensitive changes such as password, payout, address, or account recovery actions.
- Send alerts for unusual security events and retain minimal audit data needed for investigation.

## Checkout and payment requirements

- Use a reputable payment provider's hosted or tokenized payment fields; do not handle raw card data directly.
- Verify provider webhooks by signature and make webhook processing idempotent.
- Create orders and payment records on the server; reconcile final payment status through trusted provider notifications.
- Use idempotency for payment initiation and order creation.
- Confirm final totals, stock, promotion eligibility, delivery cost, and address eligibility on the server immediately before purchase.

## Security test checklist

- Unauthenticated and low-privilege users cannot access account/admin data by changing URLs or API requests.
- OTP reuse, expiry, brute force, resend flooding, and account-enumeration attempts fail safely.
- Modified cart totals, product IDs, discounts, roles, and order IDs are rejected by the backend.
- Tokens, PII, payment data, and OTPs are absent from browser storage, URLs, analytics, error tools, and logs.
- Checkout remains safe when requests are repeated, delayed, reordered, or interrupted.
