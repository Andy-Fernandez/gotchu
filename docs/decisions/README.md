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
