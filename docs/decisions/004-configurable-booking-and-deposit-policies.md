# ADR 004: Configurable booking and deposit policies for the pilot

- Status: accepted
- Date: 2026-09-11
- Owners: Product founders

## Context

The single-shop MVP needs a predictable policy for deposits, cancellations, rescheduling, late arrivals, no-shows, walk-ins, and receipts submitted through the fixed shop QR. The first discussion left several thresholds open and risked creating different rules for online, WhatsApp, phone, and in-person demand.

The product must keep one authoritative schedule, preserve payment history, avoid selling an interval twice, and remain usable when a human still has to review a receipt. The thresholds are operational defaults rather than infrastructure choices, so the shop must be able to tune them as pilot evidence accumulates.

## Decision

Adopt the following shop-scoped, configurable defaults for the MVP:

- Customer cancellation is penalty-free at least 24 hours before the appointment. The customer chooses a full manual refund through WhatsApp or transfer of the deposit to another appointment. Within 24 hours, the full deposit is retained as a penalty and the interval is released after the authoritative transition.
- Customer rescheduling is penalty-free at least 8 hours before the appointment and permits one deposit transfer to a replacement booking. Within 8 hours, the deposit is retained and a new booking requires a new deposit. The original booking remains in history and links to the replacement.
- If the shop cancels, the customer chooses a full refund or deposit transfer without penalty, including on the same day. Refunds are manual and must be completed within 24 hours of the request by the owner or an authorized manager.
- The shop deposit defaults to 20% of the booking total. A service may override it with another percentage or a fixed amount in bolivianos. The reservation stores the mode, configured value, and applied amount as a snapshot. Walk-ins do not pay an advance deposit.
- The no-show tolerance defaults to 10 minutes. The assigned barber may mark their own appointment; manager and owner may mark any appointment. After a no-show, remaining capacity can be reused only if the complete replacement service and buffer fit before the next protected appointment. A late arrival within tolerance may receive a shortened service, still charged at the full price.
- A combined reservation uses one barber, one continuous interval, the summed service duration, and one final 10-minute buffer. The buffer is separate from the no-show tolerance.
- Walk-ins share the same agenda, are registered FIFO, use an eligible available barber or the requested barber when capacity permits, and pay at completion. The assigned barber records the final payment method and amount.
- The MVP uses one fixed shop QR and human receipt review. The request includes the exact amount, customer name, appointment time, and booking code. A receipt from WhatsApp or the app is a pending claim, not automatic proof. Replacement is allowed for one hour, with a hard cutoff 30 minutes before the appointment, whichever comes first. Review has a target of two accumulated open-hours.
- Public online booking requires at least two hours of lead time. Closer requests are staff-assisted through WhatsApp when available or become walk-ins without an advance deposit. A future provider-specific QR/link and automatic confirmation require a separate decision.

All sources use the same atomic scheduling operations. Sensitive actions remain authorized and audited, and money is stored in integer minor units in the shop's initial `America/La_Paz` timezone.

## Consequences

- Customers receive a concise and deterministic policy before paying.
- Shop operators can tune thresholds without changing domain code, while each booking preserves the effective values used at creation.
- The live board can reuse released no-show capacity without displacing confirmed appointments.
- Human review remains an operational responsibility in the MVP; the two-hour target and replacement window must be measured during the pilot.
- Legal review is still required for the wording and enforceability of deposit retention and refunds before broader commercial use.

## Alternatives considered

### One shared six- or four-hour threshold

Rejected because cancellation and rescheduling have different operational consequences. Separate 24-hour and 8-hour defaults are easier to explain while remaining configurable.

### Automatic payment confirmation in the MVP

Deferred because no provider, webhook contract, reconciliation process, or failure policy has been selected. A receipt remains a human-reviewed claim for the pilot.

### Separate schedules for online, WhatsApp, and walk-ins

Rejected because it permits conflicts and hidden capacity. Every source must write to the same agenda and availability invariants.

## Links

- `docs/product/business-rules.md`
- `docs/product/core-workflows.md`
- `docs/domain/domain-model.md`
- `docs/product/mvp-scope.md`
- `docs/engineering/architecture.md`
