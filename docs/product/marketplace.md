# Future marketplace and maps

Marketplace and map-based discovery are an explicit product direction, not part of the first implementation scope.

## Sequence

```text
Phase 1: one barbershop, closed customer and business flow
→ prove trustworthy availability and operational adoption
→ activate a small group of operationally ready shops
→ add local marketplace discovery and maps
→ expand geography only after density and conversion are proven
```

The first customer enters through one barbershop's direct link or QR. The first business experience configures and operates only that shop. No marketplace home, cross-shop results, ranking, map, geolocation, or place search is required yet.

## Prepare without building prematurely

The initial product should preserve these seams:

- Stable shop IDs and shop-scoped public URLs.
- Shop-scoped catalogs, staff eligibility, hours, policies, availability, holds, bookings, queues, and audit events.
- Public shop data separated from private operational data.
- One authoritative availability and booking domain reusable from direct links and future discovery.
- Configuration rather than anchor-shop-specific code.

Preparation does not mean adding unused geographic tables, provider SDKs, ranking engines, map components, or multi-shop administration. Introduce those only when the marketplace phase is approved.

## Eventual marketplace experience

When activated, the intended journey is:

```text
Open marketplace
→ choose an area or optionally share location
→ explore synchronized map and list results
→ select a verified shop
→ compare services, prices, barbers, hours, policy, and live availability
→ enter the same atomic hold and QR deposit reservation flow
```

Direct shop links remain valid and enter at the shop-profile step.

## Future product rules

- Map and list are two views of the same result and filter state.
- Manual area search works without device location.
- Customer geolocation is optional, requested through a clear user action, and never exposed to merchants.
- The list remains usable if map services fail or bandwidth is poor.
- Public shop addresses and pins are merchant-verified.
- Marketplace profiles reuse authoritative shop catalog, policy, and availability data.
- A result never reserves capacity; only the existing atomic hold operation does.
- Paid placement is not mixed into organic ranking without an explicit future decision and disclosure.

## Trigger to begin marketplace implementation

Begin detailed marketplace design and provider selection only after:

- The anchor shop completes the full customer and business workflows reliably.
- Schedule capture and staff adoption show the source data is trustworthy.
- Critical scheduling and payment-review defects are resolved.
- More than one nearby shop is ready or committed, creating useful local supply.
- The team defines the marketplace learning goal, launch area, and success metrics.

## Decisions to make later

- Map, geocoding, and place-search provider.
- Geospatial storage and query strategy.
- Initial discovery filters and ranking signals.
- Publication-readiness rules for shops.
- Shop imagery and moderation.
- Privacy-safe location analytics.
- Performance and failure behavior for live availability in result lists.

Evaluate providers using Bolivia coverage, licensing, privacy, accessibility, bundle weight, cost, and failure modes. Record provider and ranking decisions in separate ADRs.
