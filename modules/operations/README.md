# Operations

Owns the live business workflow: manual appointments, walk-ins, queue state, service start/completion, no-show, and final payment capture.

The first service-history read model lives here because it combines booking,
execution, source, and final-payment snapshots for staff. Its current in-memory
records are explicitly fictional demo data; pages consume the typed reader so a
future authenticated, shop-scoped adapter can replace them without changing the
UI contract.
