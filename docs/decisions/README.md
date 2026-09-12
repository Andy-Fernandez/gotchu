# Architecture decision records

Use ADRs for durable choices that constrain future work, especially infrastructure selections, security models, changes to product invariants, or additions beyond the MVP boundary.

Name records sequentially: `001-short-title.md`, `002-short-title.md`, and so on. Do not create an ADR for a small reversible implementation detail.

Status values: `proposed`, `accepted`, `superseded`, or `rejected`.

When a decision changes, preserve the old record and link it to the replacement.

## Decision index

| ADR | Status | Decision |
|---|---|---|
| `001` | Superseded | Marketplace and maps inside the first MVP |
| `002` | Accepted | Close the one-shop customer and business flow first; marketplace and maps later |
| `003` | Accepted | Build the first MVP as a Next.js modular monolith |
| `004` | Accepted | Configurable booking, deposit, queue, and payment-review policies for the pilot |
| `005` | Accepted | Google staff authentication and shop-scoped RBAC authorization |
| `006` | Accepted | Private object storage for receipt claims |
| `007` | Accepted | Vercel Pro hosting and scheduled jobs for the real pilot |
