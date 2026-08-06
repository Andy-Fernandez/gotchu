# Server infrastructure

Provider-specific integrations live behind the application and domain boundaries:

- `data/`: database client, transactions, and persistence adapters.
- `auth/`: authentication-provider adapter and session resolution.
- `storage/`: private receipt-object storage.
- `jobs/`: retry-safe hold expiry, retention, and operational jobs.
- `observability/`: structured logs, tracing, and error reporting.

Server-only code must use `server-only`, keep secrets out of render DTOs, and never be imported into Client Components.
