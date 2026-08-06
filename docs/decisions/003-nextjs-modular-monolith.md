# ADR 003: Next.js modular monolith for the first MVP

- Status: accepted
- Date: 2026-08-06
- Owners: Product founders

## Context

The first implementation must close the customer and business flows for one barbershop while preserving a clean path toward multiple shops, marketplace discovery, and automatic payment verification. Database, authentication, storage, analytics, and deployment providers remain undecided.

Splitting the product into deployable services now would add operational and consistency costs before traffic or team boundaries justify them. Putting business rules directly in App Router pages or actions would make concurrency, authorization, and future reuse fragile.

## Decision

Build Gotchu as one Next.js App Router application organized as a modular monolith.

- `app/` owns routing, layouts, rendering, and thin transport adapters.
- `components/` owns reusable UI primitives and product presentation patterns.
- `modules/` owns shop-scoped domain capabilities and typed application operations.
- `server/` owns provider-specific infrastructure behind module boundaries.
- Server Components perform internal reads through application operations.
- Server Actions handle mutations initiated by Gotchu UI and remain thin.
- Route Handlers are reserved for external HTTP consumers, webhooks, and upload flows that require an endpoint.
- Business invariants are enforced in domain/application services and authoritative storage transactions, never only in UI code.

The first deployment remains one application and one relational persistence boundary. A module may be extracted only after evidence shows an independent scaling, reliability, security, or ownership need.

## Consequences

- Customer and staff surfaces can evolve independently while sharing one scheduling and booking truth.
- Provider choices remain replaceable and can be recorded in later ADRs.
- The codebase avoids premature network boundaries and duplicated API contracts.
- Module boundaries require discipline even though TypeScript cannot enforce every dependency direction automatically.
- Concurrency and financial correctness still depend on the future database and transaction design.

## Alternatives considered

### Route-centric Next.js application

Rejected because colocating all logic with pages and actions would couple business rules to delivery concerns and encourage duplication across public, staff, and future marketplace surfaces.

### Microservices from the start

Rejected because the single-shop MVP does not justify distributed transactions, multiple deployments, network failure modes, or independent operational ownership.

### Separate frontend and backend applications

Deferred because App Router provides the server boundary needed for the MVP. A separate public API can be introduced later if native clients or external consumers require it.

## Links

- `docs/engineering/architecture.md`
- `docs/domain/domain-model.md`
- `docs/product/mvp-scope.md`
- `docs/decisions/002-single-shop-first-marketplace-later.md`
