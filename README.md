# Gotchu

Gotchu is a mobile-first operating system for Bolivian barbershops, designed to evolve into a local marketplace with map-based discovery.

The first release closes the complete flow for one barbershop. Customers enter through that shop's direct link or QR, book against trustworthy availability, and follow their reservation. The same shop's team operates bookings, staff-created appointments, walk-ins, queues, services, and QR deposits in one schedule. Marketplace discovery and maps come after this core works reliably.

## Start here

- [Documentation map](docs/README.md)
- [Product brief](docs/product/brief.md)
- [MVP scope](docs/product/mvp-scope.md)
- [Future marketplace and maps](docs/product/marketplace.md)
- [Core workflows](docs/product/core-workflows.md)
- [Operational business rules](docs/product/business-rules.md)
- [Domain model](docs/domain/domain-model.md)
- [Engineering guide](docs/engineering/architecture.md)
- [Pilot and success measures](docs/business/pilot.md)

Coding agents should read [AGENTS.md](AGENTS.md) first. It contains the minimum project context and routes tasks to the relevant documents.

## Local development

Requirements: Node.js 24 (including native TypeScript support for unit tests) and pnpm 11.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful checks:

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

## Current state

The Next.js scaffold and shared UI primitives are established. Day 1 adds the [public catalog module](modules/catalog/README.md): domain types, a fictional Bolivian demo shop with two barbers and three services, and a tested `getPublicShopProfile(shopSlug)` operation. Public page integration is planned for Day 2; availability, bookings, and infrastructure remain unimplemented.
