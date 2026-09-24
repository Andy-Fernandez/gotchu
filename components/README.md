# Component boundaries

- `ui/`: reusable visual primitives with no Gotchu business rules.
- `brand/`: approved logo, icon, confirmation-mark, and splash compositions.
- `layout/`: reusable shells and navigation composition.
- `booking/`: customer-booking patterns composed from `ui/` primitives.
- `schedule/`: agenda and queue presentation patterns.
- `payments/`: receipt and payment-review presentation patterns.

Business decisions do not belong in components. Components receive minimal typed DTOs and invoke controlled application operations.

The `/dev/ui` lab previews shared UI primitives and their established variants and states. Add examples there when a new reusable UI variant is introduced so it can be reviewed before product use.
