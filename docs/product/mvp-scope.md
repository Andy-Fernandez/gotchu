# MVP scope

This boundary applies to the anchor-shop product. Expansion work begins only after the pilot gates in `../business/pilot.md` are met.

## Required

### Merchant setup

- One merchant, one shop, one physical location.
- Multiple barbers with service eligibility.
- Shop hours, barber hours, breaks, and blocked periods.
- Service catalog with price, duration, buffer, and fixed deposit.
- Central shop QR image.
- Simple cancellation and no-show policy.

### Customer booking

- Public, mobile-first booking link with no required account.
- Service-first availability and “any eligible barber” or a specific barber.
- Server-revalidated, ten-minute hold assigned to an exact barber.
- Customer name and WhatsApp number.
- QR deposit instructions and receipt upload.
- Clear held, pending-review, confirmed, cancelled, and rescheduled states.
- Private booking-status access.
- One reschedule within policy and a cancellation request.

### Staff operations

- One live daily board for appointments, holds, pending reservations, in-progress work, and queue entries.
- Manual appointments from WhatsApp, phone, or in-person requests.
- Fast walk-in registration, assignment, and estimated start.
- Conflict protection around confirmed appointments.
- Start, complete, cancel, and mark no-show.
- Record final amount and payment method.

### Owner and pilot operations

- Approve, reject, or approve a deposit with a documented difference.
- Configure core services, staff, hours, deposits, and policy.
- See operational and adoption metrics.
- Audit sensitive actions.
- Track activation, schedule capture, merchant health, and pilot feedback.
- Export data for pilot analysis.

## AI, after the deterministic core works

The first candidate is staff quick entry: natural language or dictation becomes a structured draft for one or more walk-ins, followed by explicit staff confirmation.

The second candidate is a customer concierge: it extracts constraints, queries the authoritative availability operation, shows returned slots, asks for confirmation, and creates a hold through the same domain operation as the visual flow.

AI must not invent slots, calculate overlaps independently, approve a receipt, change prices or policy, move confirmed appointments, grant refunds, bypass authorization, write directly to storage, or claim success before the backend responds.

## Outside the MVP

- National marketplace, public reviews, or paid placement.
- Native iOS or Android apps.
- Multiple locations per merchant.
- Expansion beyond barbershops.
- Loyalty, memberships, prepaid packages, or advanced marketing.
- Payroll, accounting, inventory, complex commissions, or staff auto-scheduling.
- Automated bank reconciliation or refunds.
- Dynamic pricing, demand forecasting, promotions, or a fully autonomous receptionist.
- Complex customer risk scoring.

These are exclusions, not a backlog. Adding one requires an explicit scope decision and an ADR when it changes product architecture.

## MVP acceptance

The anchor product is ready for real use when the complete booking-to-completion and walk-in-to-completion journeys work; all demand affects one schedule; concurrent users cannot secure overlapping capacity; financial and sensitive actions are auditable; owner metrics expose adoption; and the PWA works on normal mobile browsers.
