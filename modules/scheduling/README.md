# Scheduling

Owns working-time evaluation, protected intervals, slot generation, atomic holds, and queue allocation. Every capacity write revalidates on the server.

## Availability (Day 3)

`availability.ts` is a framework- and persistence-independent public-read domain
operation. It uses the active, shop-scoped records in a `Catalog`, then evaluates
one shop-local date in `America/La_Paz`:

```ts
import { calculatePublicAvailability } from "@/modules/scheduling/availability";

const result = calculatePublicAvailability({
  catalog,
  shopId,
  serviceIds,
  date: "2026-09-14",
  barberWorkingHours,
  protectedIntervals,
  blockedPeriods,
  policy: { slotIntervalMinutes: 15, combinedServiceBufferMinutes: 10 },
});
```

The returned `selection` snapshots the selected services' total integer price,
service duration, final buffer, and eligible barber IDs. Every returned `slot`
names one exact eligible barber and exposes the service end and protected end.
Slots are generated on the configured minute cadence and are valid only when the
entire protected interval fits inside both the shop and barber schedules, does
not collide with a protected interval, and does not collide with a shop or
barber blocked period. Intervals are half-open: `[start, end)`.

For a single service its configured buffer is used. Combined services sum their
durations and use exactly one configured final buffer; individual service
buffers are not accumulated. The current operation deliberately does not create
holds, bookings, queue entries, or database records.

`public-booking-page-state.ts` adapts that operation for the shop-scoped preview. It accepts one or more public services, requires an explicit valid barber preference before accepting a slot token, exposes seven quick dates plus the full 30-day range, and revalidates every URL-supplied slot against freshly calculated advisory availability. Its demo adapter currently has no protected agenda or blocked periods, so the UI must never describe those slots as reserved or authoritative.
