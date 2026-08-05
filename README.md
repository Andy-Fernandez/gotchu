# Gotchu

Gotchu is a mobile-first operating system for Bolivian barbershops. The first MVP unifies customer bookings, staff-created appointments, walk-ins, live queues, and QR-secured reservation deposits in one operational schedule.

The product is intentionally narrow: prove dependable daily use in one anchor shop, then a small group of nearby shops. It is not a generic salon marketplace.

## Start here

- [Documentation map](docs/README.md)
- [Product brief](docs/product/brief.md)
- [MVP scope](docs/product/mvp-scope.md)
- [Core workflows](docs/product/core-workflows.md)
- [Domain model](docs/domain/domain-model.md)
- [Engineering guide](docs/engineering/architecture.md)
- [Pilot and success measures](docs/business/pilot.md)

Coding agents should read [AGENTS.md](AGENTS.md) first. It contains the minimum project context and routes tasks to the relevant documents.

## Local development

Requirements: Node.js compatible with Next.js 16 and pnpm 11.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful checks:

```bash
pnpm lint
pnpm build
```

## Current state

The repository is a newly scaffolded Next.js application. Product documentation is established; implementation has not yet begun.
