# File Structure

## Principle

Organize by business feature first. A developer working on checkout should find its screens, state, services, types, and tests together instead of searching unrelated global folders.

## Target source layout

```text
src/
  app/            application bootstrap, providers, routes, store setup
  pages/          route-level screen composition
  features/       domain modules: auth, catalog, cart, checkout, orders, account
  components/     reusable domain-neutral UI components
  layouts/        shared page shells and navigation
  services/       API client, integration adapters, error normalization
  hooks/          reusable cross-feature hooks
  lib/            small framework-agnostic utilities
  types/          shared TypeScript types only
  styles/         Tailwind entry point and global base styles
  assets/         static images, icons, fonts
  test/           test setup, fixtures, and test helpers
```

## Feature layout

Each feature should use only the parts it needs. Typical contents are:

```text
features/cart/
  components/     cart-specific UI
  state/          Redux slice, selectors, thunks/listeners
  services/       cart endpoint wrappers, if unique to this feature
  hooks/          feature hooks that hide state details from UI
  types/          feature-specific models
  validation/     input schemas and messages
  tests/          unit and integration tests
```

## Placement rules

- A component used by one feature stays within that feature.
- Promote a component to `components/` only after it is truly reusable and has no domain knowledge.
- A page should compose feature components; move logic out when the file becomes responsible for a workflow.
- Place a type beside its feature unless multiple unrelated features genuinely use it.
- Place API mapping near the service that consumes it; do not leak raw API response shapes throughout the UI.
- Avoid generic dumping grounds such as `utils`, `helpers`, or `common`; name the purpose instead.

## Naming rules

- Directories and files: lowercase kebab-case, except React components may use PascalCase filenames.
- React components and TypeScript types: PascalCase.
- Hooks: begin with `use`.
- Redux slice/action/selector names: express the domain intent, not a UI event.
- Tests: colocate near the code they cover or put them in the feature's `tests/` folder.

## Import rules

- Prefer imports that follow the architecture: pages may import features; features may import shared modules; shared modules must not import features or pages.
- Prevent circular dependencies.
- Use public feature entry points when a feature is consumed elsewhere; do not reach into its private internal folders.
