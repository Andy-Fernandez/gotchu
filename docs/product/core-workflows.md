# Core workflows

Detailed edge cases, permissions, operational defaults, and failure behavior are defined in `business-rules.md`.

## Customer entry

1. The anchor barbershop shares its public link through WhatsApp, Instagram, Google Business, a physical QR, or direct recommendation.
2. Customer opens that shop's public page without creating an account.
3. Customer sees the shop's active services, prices, hours, policy, and trustworthy availability.
4. Customer selects a service and enters the reservation flow below.

Future marketplace and map discovery must enter at this same public shop page and reuse the same availability and booking operations. It must not create a parallel reservation flow.

## Customer reservation

1. Customer opens the shop's direct public link without creating an account.
2. Customer selects one or more services. Show the combined total, summed duration, one eligible barber, the deposit due now, and remaining balance.
3. Customer chooses any eligible barber or a specific barber.
4. Backend returns only intervals that fit the selected services plus one final buffer for the reservation.
5. On slot selection, the backend recalculates capacity, resolves an exact barber, and atomically creates a ten-minute hold.
6. Customer provides name and WhatsApp number.
7. For a public booking at least two hours ahead, customer sees the fixed shop QR, exact amount, booking code, policy summary, and countdown, then submits a receipt claim through the app. The same details may be sent by WhatsApp for staff-assisted bookings.
8. Receipt submission changes the reservation to `reserved_pending_review`; the interval remains occupied during review. An authorized human must approve it before the reservation becomes confirmed; QR and receipt upload never confirm payment automatically.
9. An authorized human approves, approves with a documented difference, requests a replacement receipt, or rejects the submitted claim with a specific reason. A replacement creates a new linked claim and preserves the earlier review.
10. Staff starts the service, records the remaining payment, and completes it.

The public flow does not promise online confirmation for a start time less than two hours away. Staff may handle that request manually through WhatsApp if available; otherwise the customer can arrive as a walk-in without an advance deposit.

Refresh availability when the service, barber preference, or date changes; periodically while selection is open; and immediately after a failed hold.

### Public booking interaction contract

The direct shop page uses a compact, familiar profile pattern: cover image, shop identity, address, one primary booking action, service rows, and collapsed hours and policies. The reservation itself is a four-screen assistant: `service → professional → date/time → customer details and deposit`. Only the current decision is expanded; earlier choices appear in a compact editable summary instead of remaining in the scroll.

- The service screen supports one or more services and keeps one clear continuation action.
- The professional screen requires an explicit choice between any eligible professional and one named eligible professional.
- The schedule screen uses a horizontally scrollable short-date strip, an optional native date input for the full booking window, and a native grouped time menu to avoid a long wall of slots.
- The last screen contains local substates for customer data, deposit instructions, receipt selection, and the resulting pending-review state; it does not add another top-level step.
- Back navigation preserves upstream choices and clears downstream values that depend on a changed service, professional, date, or time.

Until an authoritative hold and receipt endpoint exist, this interface must remain visibly labeled as a preview. It may demonstrate the form, a non-scannable QR, and the shape of `pending_review`, but it must not claim that a hold, upload, payment, reservation, or confirmation occurred.

## Manual appointment

An incoming WhatsApp message or phone call is not itself a reservation. Staff captures it using the same scheduling operation as online booking. The backend revalidates availability, duration, exact barber, and buffer; required data is service, date/time, customer name, WhatsApp number when available, and a deposit decision.

Deposit paths are: record a receipt claim, use an authorized no-deposit path, or record an owner-approved exception. Every bypass records actor and reason.

## Walk-in queue

Walk-ins share the single agenda with every other source. Staff records arrival time, services, barber preference, status, price, and payment. Entries are served FIFO by registration time, assigned to an eligible available barber or to the requested barber when capacity exists. Walk-ins do not pay an advance deposit and settle at completion.

Fast entry requires only a service and barber preference; identity and notes are optional. Arrival time is automatic.

Each allocated entry receives an exact barber plus estimated start and end. It must fit before the barber's next protected appointment, start after it, or move to another eligible barber. Once validated, its interval immediately blocks online availability.

When work runs late, recalculate waiting estimates and highlight risk. Never automatically move a confirmed appointment. A staff member decides whether to reassign waiting work.

Queue estimate quality is measured as the absolute difference between estimated and actual start; report median, 90th percentile, and share within the promised tolerance.

## Availability

The selected service determines duration, buffer, eligible barbers, price, deposit, and valid starts. A candidate interval is valid only when the shop is open, the barber is working and eligible, the full interval fits, and there is no overlap with:

- Confirmed or manually entered appointments.
- Reservations pending deposit review.
- Active holds.
- In-progress services.
- Allocated walk-ins.
- Breaks or blocked periods.

After a no-show is marked, remaining capacity may be reused for a walk-in or another assignment only when the full service plus buffer fits before the next protected appointment. A confirmed appointment is never displaced.

Use the half-open interval rule:

```ts
existingStart < candidateEnd && candidateStart < existingEnd
```

Polling every 15–30 seconds is acceptable for the MVP, but every write must revalidate on the server. Hold, booking, and queue allocation writes must be atomic and safe under concurrent requests.

## Deposits

An online booking requires a deposit that defaults to 20% at shop level and can be overridden per service as a percentage or fixed boliviano amount. It is part of the final price, not an extra fee. The reservation snapshots deposit mode, configured value, and applied amount. Walk-ins already present do not require one.

A receipt image is evidence submitted for review, not verified payment. Review checks destination, amount, transaction existence, date/time, duplicate references, and readability. Human approval remains required throughout the MVP.

The payment-verification boundary must allow a later integration with a compatible banking-confirmation service. The MVP does not select a provider. A future provider may supply a QR or payment link unique to a reservation, but it must use the same payment state transitions and booking operations, with authenticated and idempotent webhook processing plus human-review fallback; it must not write directly to storage or create a parallel booking flow.

Initial abuse protections include one active pending online reservation per WhatsApp number, one hold per session, rate limits, reference-duplication warnings, receipt hash as a secondary signal, and automatic expiry when no receipt is submitted.

## Rescheduling and cancellation

La cancelación del cliente usa umbral configurable de 24 horas: con al menos ese tiempo puede transferir o pedir devolución completa manual por WhatsApp (máximo 24 horas); con menos, retiene 100% y se libera el intervalo. La reprogramación usa umbral independiente de 8 horas: permite una transferencia gratuita del anticipo; fuera de plazo se retiene y se exige nuevo anticipo. Si cancela la barbería, el cliente elige devolución o transferencia sin penalización, incluso el mismo día.

Never overwrite history. Mark the original `rescheduled`, create a linked replacement, and transfer the deposit record.

## Completion

Completion records source, barber, service items, actual times when available, final amount, payment method, and actor. Supported initial methods are shop QR, cash, complimentary, and other. The remaining balance is settled directly at the shop; the assigned barber records amount and method after completion. When a customer arrives within the late-arrival tolerance and the service is shortened to protect the next appointment, the full price still applies.

The MVP does not collect the remaining balance online. Customer and staff settle it directly at the shop; staff records the final amount and summarized method in Gotchu so completion and financial history remain trustworthy.

An add-on is allowed only when the extended protected interval still fits before the next commitment. Otherwise select another barber, shorten the work, book later, or decline.
