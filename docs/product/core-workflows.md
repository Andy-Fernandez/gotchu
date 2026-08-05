# Core workflows

## Customer reservation

1. Customer opens a shop's public link without creating an account.
2. Customer selects a service. Show full price, duration, deposit due now, and remaining balance.
3. Customer chooses any eligible barber or a specific barber.
4. Backend returns only intervals that fit the service plus buffer.
5. On slot selection, the backend recalculates capacity, resolves an exact barber, and atomically creates a ten-minute hold.
6. Customer provides name and WhatsApp number.
7. Customer sees the shop QR, exact amount, policy summary, and countdown, then uploads a receipt claim.
8. Receipt submission changes the reservation to `reserved_pending_review`; the interval remains occupied during reasonable review.
9. An authorized human approves, approves with a documented difference, or rejects the deposit.
10. Staff starts the service, records the remaining payment, and completes it.

Refresh availability when the service, barber preference, or date changes; periodically while selection is open; and immediately after a failed hold.

## Manual appointment

Staff captures bookings received through WhatsApp, phone, or in person using the same scheduling operation as online booking. Required data is service, exact barber, date/time, customer name, WhatsApp number when available, and a deposit decision.

Deposit paths are: record a receipt claim, use an authorized no-deposit path, or record an owner-approved exception. Every bypass records actor and reason.

## Walk-in queue

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

Use the half-open interval rule:

```ts
existingStart < candidateEnd && candidateStart < existingEnd
```

Polling every 15–30 seconds is acceptable for the MVP, but every write must revalidate on the server. Hold, booking, and queue allocation writes must be atomic and safe under concurrent requests.

## Deposits

An online booking requires a small, service-specific fixed deposit. It is part of the final price, not an extra fee. Walk-ins already present do not require one.

A receipt image is evidence submitted for review, not verified payment. Review checks destination, amount, transaction existence, date/time, duplicate references, and readability. Human approval remains required until a reliable regulated integration exists.

Initial abuse protections include one active pending online reservation per WhatsApp number, one hold per session, rate limits, reference-duplication warnings, receipt hash as a secondary signal, and automatic expiry when no receipt is submitted.

## Rescheduling and cancellation

Initial policy hypothesis: one reschedule at least four hours in advance; the deposit transfers to the replacement; late cancellation or no-show may lose it; shop cancellation triggers refund or transfer.

Never overwrite history. Mark the original `rescheduled`, create a linked replacement, and transfer the deposit record.

## Completion

Completion records source, barber, service items, actual times when available, final amount, payment method, and actor. Supported initial methods are shop QR, cash, complimentary, and other.

An add-on is allowed only when the extended protected interval still fits before the next commitment. Otherwise select another barber, shorten the work, book later, or decline.
