# ADR 005: Google staff authentication and shop-scoped authorization

- Status: accepted
- Date: 2026-09-12
- Owners: Product founders

## Context

Gotchu needs individual staff identity without creating a separate customer-account product. Authorization must protect one shared schedule, financial exceptions, operational actions, and future multi-shop use. A UI-only role check or a shared staff login would not establish who performed a sensitive action or prevent cross-shop access.

The product is a modular monolith with a global person identity and shop-scoped operations. The first pilot has three base roles—barber, manager, and owner—but it also needs a small number of explicit financial exceptions and temporary platform support access.

## Decision

Staff authenticate with individual Google accounts. Shared staff accounts are not allowed. Gotchu owns the shop membership and authorization model: a global identity receives a membership in each shop, and that membership contains one base role plus a small, closed list of explicit permissions for exceptions such as financial review or refunds.

- The owner invites staff and administers members, roles, and permissions.
- Gotchu validates an active membership for the relevant shop before every protected operation.
- A person may have different roles and permissions in different shops.
- `barber`, `manager`, and `owner` are the base roles. A manager operates only within the delegation granted by the shop; a barber cannot configure permissions.
- Platform support is temporary, explicitly granted, scoped to the shop, and audited.
- The backend revalidates identity, membership, role, explicit permission, shop/resource scope, current state, and domain invariants. The UI is not an authorization boundary.
- The authorization surface is RBAC with finite explicit permissions; the MVP will not include a free-form permission builder, ABAC, or a dynamic policy engine.
- Customers do not create accounts and do not use Google or OTP. They access private booking status and actions through a non-guessable guest token. WhatsApp is a contact channel, not an identity provider.

The concrete Google Auth integration, session implementation, and persistence/data-access provider remain implementation choices behind the server-side typed application boundary.

## Consequences

- Financial and permission-sensitive actions have an attributable human actor.
- The same global identity can operate multiple shops without flattening roles across tenants.
- Membership checks and explicit permission checks must be centralized and tested on the server.
- Owners take on member-invitation and access-revocation responsibilities.
- Google availability, session lifecycle, account recovery, and provider configuration remain operational dependencies to validate before the real pilot.
- A future marketplace can reuse shop-scoped public data without making customer access depend on a marketplace account.

## Alternatives considered

### Shared staff credentials

Rejected because they prevent reliable attribution, make revocation unsafe, and encourage access to outlive a staff relationship.

### Customer accounts for the MVP

Rejected because the direct-link flow needs low-friction guest access and does not require account recovery, Google, or OTP for customers.

### One global role per person

Rejected because the same person may work for multiple shops with different responsibilities.

### Free-form permissions or ABAC

Deferred because a configurable policy engine would add complexity and an unbounded authorization surface before pilot evidence justifies it. Explicit finite permissions cover the MVP's known exceptions.

## Links

- `docs/engineering/architecture.md`
- `docs/domain/domain-model.md`
- `docs/product/business-rules.md`
- `docs/product/core-workflows.md`
- `docs/product/mvp-scope.md`
