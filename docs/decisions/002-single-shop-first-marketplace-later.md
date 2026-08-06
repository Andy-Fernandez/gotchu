# ADR 002: Close one-shop flow before marketplace and maps

- Status: accepted
- Date: 2026-08-06
- Owners: Product founders
- Supersedes: ADR 001

## Context

ADR 001 placed marketplace discovery and maps inside the first MVP. The product direction has been clarified: Gotchu should prepare to become a marketplace with maps, but the first implementation must close the complete customer and business workflow for one barbershop.

Building discovery before the underlying merchant operation is trustworthy would expand scope and test two difficult systems at once. The future marketplace depends on accurate shop catalogs, availability, holds, bookings, queues, and completion data.

## Decision

The first MVP supports one barbershop and one location.

Customers enter through that shop's direct public link or QR. They view its services and availability, create a hold, submit the QR deposit receipt, follow reservation status, and complete the appointment flow. Staff and owners operate online and manual appointments, walk-ins, queues, services, payments, configuration, audit, and metrics for the same shop.

Marketplace search, map/list discovery, customer geolocation, geocoding, geographic ranking, and cross-shop comparison are deferred. The initial system will remain explicitly shop-scoped and reusable so those capabilities can later route customers into the same authoritative public profile and booking domain.

## Consequences

- The first release has one complete customer journey and one complete business journey.
- Direct links and physical or social QR codes are the initial customer-acquisition entry points.
- No map provider, geospatial database feature, ranking engine, or marketplace UI is selected or implemented yet.
- Domain entities and operations remain shop-scoped; anchor-shop assumptions are configuration, not scattered hard-coded logic.
- Marketplace design begins after operational adoption is proven and multiple nearby shops can create useful supply.
- ADR 001 remains as decision history but is no longer authoritative.

## Alternatives considered

### Marketplace and maps in the first MVP

Deferred because it increases scope before trustworthy multi-shop supply and operational data exist.

### Ignore marketplace architecture until later

Rejected because hard-coding a single shop or mixing public and private data would create avoidable migration work. The MVP will preserve clean shop boundaries without building unused discovery infrastructure.

## Links

- `docs/product/mvp-scope.md`
- `docs/product/core-workflows.md`
- `docs/product/marketplace.md`
- `docs/domain/domain-model.md`
- `docs/engineering/architecture.md`
- `docs/business/pilot.md`
