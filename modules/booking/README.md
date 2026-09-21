# Booking

Owns online and staff-entered booking lifecycles, explicit transitions, private customer access, cancellation, and history-preserving rescheduling.

`demo-private-booking.ts` exists only to exercise the first customer outcome screens before persistence is selected. It serializes a fictional, non-sensitive snapshot into a visibly demo-only route token and provides deterministic presentation states for `reserved_pending_review` and `confirmed`. It is not a persistence, authentication, or authorization implementation.
