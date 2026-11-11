# Authentication and account implementation

The first storefront feature implements registration, email confirmation, sign-in, password recovery, session restoration, profile editing, and saved-address management. It uses the existing backend contracts and the supplied grocery reference. Customer-facing copy supports Romanian and English.

## Routes and ownership

| Route | Behavior |
| --- | --- |
| `/sign-in` | Email and password sign-in. Loads the full customer profile before entering the account. |
| `/register` | Name, email, password, and client-side password confirmation. Accepted requests show a generic email prompt. |
| `/verify-email` | Opens an email-link confirmation action when a token is present. Clicking it disables the button and shows verification progress. Successful verification redirects to sign-in with a confirmation notice. Failures stay on the page with a recovery link. |
| `/forgot-password` | Requests a reset link with a generic response for known and unknown addresses. |
| `/reset-password` | Sets and confirms a new password using the email link. Missing and expired links have a recovery path. |
| `/account` | Protected profile editing for name and optional phone. Email is read-only. |
| `/account/addresses` | Protected address list with create, edit, and confirmed delete actions. |

The shared shell and forms follow [the component inventory](./10-storefront-ui-reference.md). Colors are centralized in `src/styles/theme.css` and exposed through Tailwind. Plus Jakarta Sans is self-hosted. The supplied logo and hero artwork are used locally. The initial implementation uses a pale green primary action to fit the reference style.

Session state lives in Redux Toolkit in memory. Passwords and email-link tokens stay outside Redux and browser storage. Email tokens arrive in a fragment, are removed from history before React renders, and are submitted only after the customer's action. A page reload after removal requires reopening the email or requesting another link. A 45-second resend cooldown reduces accidental repeat requests, while the backend enforces its own limits.

The API client uses cookies, a 12-second request timeout, no automatic mutation retries, sanitized, translated error messages, and runtime response checks. It maps only permitted profile and address fields into UI state. An unauthorized protected request clears the session. Account contents unmount when the session ends. Frontend route guards support the experience, while the backend enforces authorization and ownership.

## Shared language selection and logout

The reusable `LanguageSwitcher` lives in the shared header on every route, including recovery and not-found screens. `LanguageProvider` wraps the application. It exposes the selected language and typed translation helper through `useLanguage`. Add future authored UI copy to `src/lib/i18n/messages.ts` and render it through this helper.

Romanian is the default. The only persisted UI preference is `lankakade.language`, containing `ro` or `en`. The selector remains functional when browser storage is blocked. Switching language updates labels, accessibility text, custom validation, notices, API errors, the document title, and the document language without clearing form drafts. Currency stays RON. User-entered names and address labels remain as entered.

The account logout button immediately requests server logout and shows pending feedback. It clears the local session and redirects to sign-in after success or an already-expired session response. A failed request keeps a visible error and retry action. Account and address links have been removed from the footer.

## Local development

1. Install dependencies with `npm ci`.
2. Start the backend using its [setup instructions](../../backend/knowledge-base/auth-and-accounts.md#local-setup). Its storefront origin must match `http://localhost:5173`.
3. Run `npm run dev` in the storefront. Vite uses port 5173 with strict port selection and forwards `/api` to the local API at port 3000. Override `API_PROXY_TARGET` in an ignored local environment file if needed.
4. For a directly hosted API, set public `VITE_API_ORIGIN` to its HTTPS origin. Local HTTP loopback origins are permitted for development. See [.env.example](../.env.example). Production requires either this setting or an explicit same-origin reverse proxy for `/api/v1`, plus SPA fallback for the UI routes.

## Verification and repeatable checks

Run `npm run build` and `npm run lint`. Browser tests use Playwright with installed Google Chrome.

The real-API browser suite requires a fresh, disposable MySQL instance. Initialize a new directory under `/private/tmp/lankakade-storefront-*` using `mysqld --no-defaults --initialize-insecure --datadir=<directory>`, then run it with a temporary socket, `--skip-networking`, and `--mysqlx=OFF`. Set `STOREFRONT_TEST_DB_SOCKET` to that temporary socket and run `node test/support/backend.mjs` in a separate terminal. This harness applies the schema and migrations, creates a least-privilege test login with a random password, starts the actual API on loopback port 3000, and captures email links in memory. It requires unused ports 3000 and 4101 and applies migrations once to a fresh database.

For the default test setup, with the storefront running on 5173, `npm run test:e2e` covers registration, verification, HttpOnly cookies, reload persistence, profile updates, address CRUD, logout, password reset, consumed reset links, and session revocation. It also checks verification progress and redirect, direct logout, both languages across routes, preference persistence, preserved form drafts and translated errors, blocked preference storage, and layouts down to 320 px. Email capture tests the application link flow. SMTP delivery and production HTTPS deployment require verification in their target environments.

For controlled failures, run `postman simulation run postman/simulations/auth-failures.sim.yaml --port 4010 --no-history`, then start a separate storefront preview with `API_PROXY_TARGET=http://localhost:4010/storefront npm run dev -- --port 5175`. Run `npm run test:api-failures`. This tests recovery from a profile-service outage, rate limiting, a malformed login response, an HTML gateway error, a request timeout, and keyboard focus. The fixture models failures on the exercised routes and returns 501 elsewhere. Its source and verification scope are recorded in [the simulation context](../postman/simulations/auth-failures.context.yaml).

Stop temporary test processes after verification. Keep their database files, screenshots, traces, and synthetic email links outside committed source.

To avoid using ports occupied by a running development session, set `STOREFRONT_TEST_API_PORT` and `STOREFRONT_TEST_ORIGIN` on the test backend harness. Run the test preview on that origin with `API_PROXY_TARGET` pointing to the isolated API, and set the same `STOREFRONT_TEST_ORIGIN` when running Playwright. Email capture continues to use loopback port 4101.
