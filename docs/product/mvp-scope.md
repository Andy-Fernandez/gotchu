# MVP scope

This boundary applies to the initial closed flow for one anchor barbershop. Both customer and business experiences operate against that one shop. Customers arrive through a direct public link or QR; there is no cross-shop discovery in this phase.

## Future-ready boundaries

- Use stable shop identity and a shop-scoped public URL.
- Keep catalog, hours, policies, availability, holds, and bookings explicitly scoped to a shop.
- Avoid hard-coding the anchor shop throughout domain logic, even if only one shop is configured.
- Keep public booking operations reusable by a future marketplace.
- Do not implement marketplace search, ranking, map rendering, geolocation, geocoding, or multi-shop operations yet.

## Required

### Merchant setup

- One merchant, one shop, one physical location.
- Multiple barbers with service eligibility.
- Shop hours, barber hours, breaks, and blocked periods.
- Service catalog with price, duration, buffer, a configurable 20% shop-default deposit, and percentage/fixed BOB service overrides.
- Central shop QR image.
- Simple cancellation and no-show policy.

### Customer booking

- Booking from the barbershop's direct public link or QR, with no required account.
- Service-first availability and “any eligible barber” or a specific barber.
- Server-revalidated, ten-minute hold assigned to an exact barber.
- Customer name and WhatsApp number.
- Fixed shop QR deposit instructions with exact amount, booking code, and receipt upload through the app or staff-assisted WhatsApp flow.
- Replacement receipt upload when the previous claim is unreadable or rejected, preserving review history.
- Clear held, pending-review, confirmed, cancelled, and rescheduled states.
- Private booking-status access.
- One reschedule within policy and a cancellation request.
- Combined services in one continuous block assigned to one barber, with a single final buffer.
- Public online booking with a two-hour minimum lead time; closer requests use manual WhatsApp handling or walk-in registration without an advance deposit.

### Staff operations

- One live daily board for appointments, holds, pending reservations, in-progress work, and queue entries.
- Manual appointments from WhatsApp, phone, or in-person requests.
- Fast walk-in registration, assignment, and estimated start.
- Conflict protection around confirmed appointments.
- Start, complete, cancel, and mark no-show.
- Record final amount and payment method.
- Register walk-ins FIFO in the shared agenda, with no advance deposit and payment at completion.
- Settle the remaining balance directly at the shop; Gotchu records the result but does not collect that balance online in this phase.

### Owner and pilot operations

- Approve, reject, or approve a deposit with a documented difference.
- Configure core services, staff, hours, deposits, and cancellation/rescheduling/no-show/lead-time policy.
- Process manual customer refunds through WhatsApp within the 24-hour target when authorized.
- See operational and adoption metrics.
- Audit sensitive actions.
- Track activation, schedule capture, merchant health, and pilot feedback.
- Export data for pilot analysis.

## AI, after the deterministic core works

The first candidate is staff quick entry: natural language or dictation becomes a structured draft for one or more walk-ins, followed by explicit staff confirmation.

The second candidate is a customer concierge: it extracts constraints, queries the authoritative availability operation, shows returned slots, asks for confirmation, and creates a hold through the same domain operation as the visual flow.

AI must not invent slots, calculate overlaps independently, approve a receipt, change prices or policy, move confirmed appointments, grant refunds, bypass authorization, write directly to storage, or claim success before the backend responds.

## Outside the MVP

- Marketplace search and cross-shop discovery.
- Map views, geolocation, geocoding, geographic ranking, and place search.
- Multi-shop customer comparison or marketplace result pages.
- Nationwide launch before local operational adoption is proven.
- Public reviews, paid placement, sponsored ranking, or auction-based visibility.
- Turn-by-turn navigation, route optimization, or courier-style live tracking.
- Native iOS or Android apps.
- Multiple locations per merchant.
- Expansion beyond barbershops.
- Loyalty, memberships, prepaid packages, or advanced marketing.
- Payroll, accounting, inventory, complex commissions, or staff auto-scheduling.
- Automated bank reconciliation or automatic payment/WhatsApp confirmation. Automatic refunds are outside the MVP; authorized manual refunds are part of the operational policy.
- Dynamic pricing, demand forecasting, promotions, or a fully autonomous receptionist.
- Complex customer risk scoring.

These are exclusions, not a backlog. Adding one requires an explicit scope decision and an ADR when it changes product architecture.

## MVP acceptance

The anchor product is ready for real use when customers can enter through that shop's direct link or QR and complete the booking-to-completion journey, while staff can complete the manual-appointment and walk-in-to-completion journeys; all demand affects one schedule; concurrent users cannot secure overlapping capacity; financial and sensitive actions are auditable; owner metrics expose adoption; and the PWA works on normal mobile browsers.
