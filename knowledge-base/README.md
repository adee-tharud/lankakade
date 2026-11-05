# Lankakade Knowledge Base

This directory is the source of truth for building and operating the Romanian e-commerce storefront. It records decisions before they turn into implementation, so the application stays secure, consistent, and easy to change.

## Architecture baseline

- Front end: React with TypeScript
- Styling: Tailwind CSS
- Client state: Redux Toolkit
- Market: Romania
- Currency: RON

## How to use this knowledge base

1. Read the architecture, structure, state, and security guides before starting a feature.
2. Follow the design-system rules when creating or changing UI.
3. Update the relevant guide in the same change whenever a decision changes.
4. Record open decisions rather than silently making product or security assumptions.

## Guides

| Guide | Purpose |
| --- | --- |
| [01 Architecture](./01-architecture.md) | Boundaries, application layers, and technology decisions. |
| [02 File structure](./02-file-structure.md) | Where each type of source file belongs. |
| [03 State management](./03-state-management.md) | Redux ownership and server-state rules. |
| [04 Design system](./04-design-system.md) | Theme, UI component, and accessibility standards. |
| [05 Security and OTP](./05-security-and-otp.md) | Account, OTP, checkout, and data-security requirements. |
| [06 Engineering standards](./06-engineering-standards.md) | Quality, testing, and delivery conventions. |
| [07 Romania commerce](./07-romania-commerce.md) | Local product, checkout, privacy, and operational considerations. |

## Decision log

When a decision affects more than one feature, add it here or link to a dated decision record. Every entry should include the decision, why it was made, its owner, and the date.

| Date | Decision | Status | Owner |
| --- | --- | --- | --- |
| 2026-11-04 | Use React, Tailwind CSS, and Redux Toolkit as the front-end baseline. | Accepted | Project team |
