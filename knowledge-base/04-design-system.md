# Design System

## Objective

Provide a cohesive, accessible shopping experience without allowing visual decisions to fragment across individual pages.

## Design-token policy

Define semantic tokens for the approved palette, typography, spacing, radii, shadows, breakpoints, and motion. Tailwind configuration should expose those tokens by intention rather than scattering raw color values across components.

Recommended semantic color roles:

| Role | Use |
| --- | --- |
| Brand | Primary actions and selected states. |
| Accent | Secondary emphasis, promotions, or highlights. |
| Surface | Page, card, elevated, and inverse backgrounds. |
| Text | Primary, secondary, muted, and inverse copy. |
| Border | Default, strong, focus, and destructive outlines. |
| Status | Success, warning, error, and information feedback. |

The final palette, typography, logo treatment, and light/dark-mode policy remain open product decisions. Add them here before building pages.

## Component hierarchy

1. Primitives: button, input, badge, icon button, checkbox, radio, select, modal, toast.
2. Composites: product card, quantity selector, price display, address form, order summary.
3. Patterns: header, search, filters, product grid, cart panel, checkout steps.
4. Pages: assemble patterns and features; they do not create new visual rules casually.

See the [storefront UI reference](./10-storefront-ui-reference.md) for the Figma review and the components to reuse across screens.

## Component requirements

- Define visual variants, sizes, loading, disabled, focus, empty, and error states before reuse.
- Use semantic HTML first; do not recreate native controls unless the behavior remains equally accessible.
- Support keyboard use, visible focus indication, readable labels, and screen-reader announcements for meaningful updates.
- Meet WCAG 2.2 AA contrast expectations, including text, controls, and error states.
- Design responsively from small screens upward. Critical shopping actions must remain reachable without hover.
- Avoid layout shifts for product images, prices, and loading content.

## Content conventions

- Use Romanian as the default customer language unless product requirements specify multilingual content.
- Display prices in RON consistently and make discounts, stock limits, delivery conditions, and errors unambiguous.
- Keep destructive actions explicit and reversible where possible.

## Tailwind hygiene

- Prefer approved token-based utility combinations over arbitrary values.
- Extract repeated, meaningful patterns into components rather than creating a large global CSS layer.
- Keep global CSS limited to resets, font setup, base elements, and documented app-wide needs.
