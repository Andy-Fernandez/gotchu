# ADR 001: Marketplace and maps are part of the MVP

- Status: superseded by ADR 002
- Date: 2026-08-06
- Owners: Product founders

> Historical record only. Do not use this ADR to define current implementation scope. ADR 002 is authoritative.

## Context

The initial strategy treated a national consumer marketplace as future scope and centered the MVP on direct shop links plus merchant operations. Product direction has changed: Gotchu should begin as a marketplace, and maps should be a first-class discovery surface from the start.

Merchant operations and marketplace discovery are interdependent. The marketplace needs trustworthy service, location, and availability data; the operating system needs a customer-acquisition surface that benefits from local density.

## Decision

The MVP will include a public local marketplace with synchronized map and list discovery, verified shop locations and profiles, service-oriented search, optional customer geolocation, and a direct path into the authoritative booking and QR deposit workflow.

The launch remains geographically constrained to one microzone. “Marketplace from the beginning” changes the product surface, data model, onboarding, analytics, and acceptance criteria; it does not require a nationwide launch, public reviews, paid ranking, navigation, or a second booking system.

The map/geocoding provider and geospatial persistence strategy remain separate implementation decisions. Manual area search and the result list must work without device location and remain usable when map services fail.

## Consequences

- Marketplace UX and maps become Phase 1 work rather than post-pilot expansion.
- Shop activation requires a verified address, map pin, and publishable profile.
- The domain needs geographic shop data, publication readiness, and marketplace-query rules.
- The product must measure discovery-to-completed-service conversion and geographic supply coverage.
- Map provider cost, licensing, Bolivia coverage, privacy, accessibility, and failure behavior become early technical concerns.
- Initial scope and testing grow, but direct links and marketplace bookings still converge on one catalog and scheduling domain.

## Alternatives considered

### Direct shop links first

Rejected because it postpones the intended marketplace value and does not test customer discovery or geographic network effects from the beginning.

### Nationwide marketplace at launch

Rejected for now because a large sparse marketplace weakens customer utility and increases merchant acquisition and support cost before local conversion and retention are proven.

### Map-only discovery

Rejected because maps can fail, are harder for some customers to navigate, and do not replace an accessible, filterable result list.

## Links

- `docs/decisions/002-single-shop-first-marketplace-later.md`
- `docs/product/marketplace.md`
- `docs/product/mvp-scope.md`
- `docs/domain/domain-model.md`
- `docs/engineering/architecture.md`
- `docs/business/pilot.md`
