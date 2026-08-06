# Component boundaries

- `ui/`: reusable visual primitives with no Gotchu business rules.
- `layout/`: reusable shells and navigation composition.
- `booking/`: customer-booking patterns composed from `ui/` primitives.
- `schedule/`: agenda and queue presentation patterns.
- `payments/`: receipt and payment-review presentation patterns.

Business decisions do not belong in components. Components receive minimal typed DTOs and invoke controlled application operations.
