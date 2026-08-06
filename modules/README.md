# Domain modules

Gotchu is a modular monolith. Each module owns a business capability and may add `domain/`, `application/`, and `infrastructure/` folders only when implementation requires them.

- `catalog/`: shop public profile, services, prices, duration, buffer, and barber eligibility.
- `scheduling/`: availability, protected intervals, atomic holds, and queue allocation.
- `booking/`: customer and manual bookings, state transitions, cancellation, and rescheduling.
- `payments/`: receipt claims, human review, balances, refunds, and future provider verification.
- `operations/`: live board, walk-ins, execution, completion, and no-shows.
- `identity/`: shop membership, roles, permissions, and customer private access.
- `audit/`: immutable sensitive-action history and privacy-minimized product events.

Modules expose typed application operations. Pages, Server Actions, Route Handlers, and future AI tools call those operations instead of implementing business rules themselves.
