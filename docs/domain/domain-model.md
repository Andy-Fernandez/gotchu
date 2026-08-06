# Domain model

This document defines concepts and invariants, not a final database schema.

## Core concepts

- **Shop:** the single pilot location and tenant boundary. It has stable identity so future marketplace discovery can reference it.
- **Shop member:** an authenticated staff user with a role and shop membership.
- **Barber:** a staff profile with working hours and eligible services.
- **Service:** a shop offering that defines price, duration, buffer, fixed deposit, and eligible barbers.
- **Booking hold:** a short-lived claim on an exact barber and interval.
- **Booking:** scheduled work from a customer flow or a staff-captured channel.
- **Queue entry:** walk-in demand with arrival, allocation, estimates, and execution state.
- **Payment:** a deposit or remaining-balance record. A receipt and an approval are distinct facts.
- **Receipt claim:** an immutable customer-submitted payment claim. Replacements create linked claims rather than overwriting rejected or unreadable evidence.
- **Blocked period:** non-service capacity such as a break or manual block.
- **Audit event:** immutable record of a sensitive action and its actor.
- **Product event:** privacy-minimized behavior used to understand funnels and adoption.

## States

```ts
type BookingStatus =
  | "draft"
  | "held"
  | "reserved_pending_review"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled_by_customer"
  | "cancelled_by_staff"
  | "rescheduled"
  | "no_show";

type PaymentStatus =
  | "unpaid"
  | "pending_review"
  | "approved"
  | "approved_with_difference"
  | "rejected"
  | "partially_paid"
  | "paid"
  | "waived"
  | "refund_pending"
  | "refunded";

type ReceiptClaimStatus =
  | "pending_review"
  | "needs_replacement"
  | "accepted"
  | "rejected";

type ReceiptReviewReason =
  | "unreadable"
  | "transaction_not_found"
  | "wrong_destination"
  | "amount_difference"
  | "duplicate_reference"
  | "other";

type QueueStatus =
  | "waiting"
  | "called"
  | "in_service"
  | "completed"
  | "left"
  | "cancelled";

type ServiceExecutionStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "cancelled";
```

Transitions must be explicit, authorized, auditable where sensitive, and covered by tests. A reschedule creates a linked booking rather than mutating the original interval.

## Scheduling invariants

- Every protected interval belongs to an exact barber, including “any barber” requests.
- Scheduled end includes service duration plus buffer.
- Protected intervals never overlap for the same barber.
- Active holds, pending-review reservations, appointments, manual appointments, in-progress work, and allocated queue entries all consume capacity.
- Expired holds do not consume capacity.
- Confirmed appointments are never silently displaced by queue allocation or delay handling.
- Server-side validation is authoritative; client availability is advisory.

## Future marketplace compatibility

- Every operational entity remains explicitly shop-scoped even while only one shop exists.
- Public shop data is separated from private operations and can later feed a marketplace profile.
- Future discovery must reference the authoritative catalog, hours, policy, eligibility, and availability.
- Future marketplace results will never reserve capacity; only the existing atomic hold operation can do that.
- Do not add customer coordinates, ranking state, or provider-specific geographic fields during the single-shop MVP without an approved decision.

## Money invariants

- Store amounts as integers in the currency's minor unit; never use binary floating point.
- Snapshot price, required deposit, and remaining balance on the booking so later catalog changes do not rewrite history.
- A deposit contributes to the final amount.
- Receipt submission and payment approval are separate events with separate actors and times.
- An unreadable receipt and a nonexistent transaction are different review outcomes. Replacement claims preserve every previous file and review result.
- Financial exceptions require authorization, reason, and audit record.
- Retrying a receipt or completion request must not duplicate money records.

## Identity and time

- Customer guest booking is allowed; private status access uses an unguessable token or equivalent mechanism.
- Store customer name and WhatsApp snapshots needed to operate the booking.
- During the MVP, WhatsApp numbers are normalized and confirmed visually but are not OTP-verified. They are contact claims, not an authorization credential.
- Store instants in a timezone-safe representation; render initial shop-local time in `America/La_Paz`.
- Shop membership and resource ownership are checked on every staff operation.

## Roles

| Role | Core authority |
|---|---|
| Customer | View public catalog/availability; manage own private booking |
| Barber | Own schedule and queue; register walk-ins; execute services; record payment/no-show |
| Manager | Shop-wide board; manual appointments; queue resolution; deposit review when granted |
| Owner | Configuration, staff, policy, financial review, metrics, export, audit |
| Platform operator | Onboarding and platform health under explicit support permissions |

Backend authorization is mandatory. UI visibility is not an authorization boundary.

## Minimum entity relationships

```text
Shop
├── members → roles / barber profile
├── services ↔ eligible barbers
├── hours / breaks / blocked periods
├── bookings → items / hold / customer snapshot / payments
├── queue entries → service / assigned barber
└── audit events / product events / health snapshots
```

The exact tables and provider-specific fields should be chosen only after the persistence and authentication decisions are made.
