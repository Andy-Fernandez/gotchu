# Engineering guide

## Current baseline

The repository uses Next.js 16.3 App Router, React 19.2, TypeScript, Tailwind CSS 4, and pnpm. Database, authentication, file storage, analytics, AI, and deployment choices are still open decisions.

Before modifying Next.js behavior, follow the repository `AGENTS.md` instruction and read the relevant installed guide under `node_modules/next/dist/docs/`.

## Target shape

```text
Mobile-first PWA
├── direct public shop page + customer booking
├── staff live board
└── owner operations
        ↓ typed application boundary
domain services
├── availability and atomic scheduling
├── booking / queue state transitions
├── deposit review and payment recording
├── provider-independent payment verification
├── authorization and audit
└── controlled AI tools (later)
        ↓
relational data + private receipt storage + background jobs
```

Business rules belong in shared domain services, not duplicated across pages, route handlers, or AI prompts.

## Required qualities

- Atomic holds and queue allocations.
- Idempotent receipt submission, payment recording, and completion.
- Expired-hold cleanup that is safe to retry.
- Structured logs and error monitoring.
- Private receipt storage with server-generated names and expiring authorized access.
- Daily backups and a tested restore process before expansion.
- A clear online/offline state; do not cache private booking or receipt data in shared browser storage.
- Immutable audit events for financial, permission, policy, and scheduling exceptions.

## Application boundaries

The exact transport is undecided, but preserve these capabilities:

- **Public booking:** shop/catalog read, availability, hold, booking identity, receipt submission, private status, reschedule, cancellation.
- **Staff:** live board, manual appointment, walk-in, assignment, start, complete, no-show, payment, add-on.
- **Financial review:** pending deposits, approve, approve with difference, reject, refund tracking.
- **Payment verification:** manual receipt review in the MVP; a provider-neutral boundary for future authenticated, idempotent confirmations from Libélula or another banking service, using the same payment state machine and human-review fallback.
- **Owner:** service/staff/hours/policy configuration, operational metrics, adoption metrics, audit.
- **Platform:** merchant activation and health for founder-led pilot support.

Every write validates input, authorization, current state, and relevant invariants on the server. Responses are authoritative only after commit.

## AI boundary

AI is an optional orchestration layer over controlled typed operations. It has no direct database access. The initial tool surface may search services, fetch live availability, create a hold, draft and confirm a walk-in, fetch private booking status, and explain shop policy.

Writes require an explicit human confirmation describing the service, barber, time, deposit, or batch of walk-ins. Log the model, requested tool, sanitized input/result, confirmation, actor, shop, and time. Avoid retaining unnecessary raw conversation text.

## Security and privacy

- Staff authentication is mandatory; guest booking is allowed through private access.
- Check tenant membership, role, barber scope, financial permission, and resource ownership server-side.
- Validate receipt type and size; never trust client filenames or public URLs.
- Collect only data needed to operate the service.
- Obtain separate consent before marketing reuse.
- Define customer export, retention, and deletion behavior before the pilot collects meaningful volume.
- Platform support access must be explicit and must never silently alter financial records.

## Future marketplace readiness

Keep shop identity and all public booking capabilities explicitly shop-scoped. Separate public profile fields from private operational data, and keep business rules outside route or page code so a future marketplace can call the same typed domain operations.

Do not install a map SDK, choose a geocoder, collect customer location, build geographic search, or introduce ranking during the single-shop MVP. When the marketplace phase begins, evaluate Bolivia coverage, licensing, attribution, privacy, accessibility, cost, performance, and failure behavior through a separate ADR.

## Verification strategy

Unit-test interval overlap, slot generation, buffers, queue fit, deposit arithmetic, policies, state transitions, schedule capture, and activation calculations.

Integration-test concurrency and boundaries: two requests for one slot, expiry versus receipt submission, duplicated payment references, staff deposit exceptions, walk-in conflicts, delayed service effects, add-on fit, idempotent completion, authorization, and AI rejection by authoritative domain rules.

End-to-end test the full stories: direct-link deposit-backed customer reservation, busy Saturday queue, manually captured WhatsApp appointment, cash walk-in completion, reschedule with deposit transfer, no-show, owner metrics, and shop activation.

Pilot-test poor connectivity, low-end phones, upload retry, absent approvers, one-person busy periods, forgotten completion, and attempts to keep a hidden paper queue.

## Decision points still open

Create ADRs before committing to:

- Database and data-access layer.
- Authentication and tenant model.
- Receipt/object storage.
- Background-job mechanism.
- Analytics and monitoring providers.
- AI model/provider and tool framework.
- Hosting and deployment topology.
- Future automatic banking-confirmation provider and webhook/reconciliation model.
- Future map rendering, geocoding, and place-search provider, when marketplace work begins.
- Future geospatial storage and query strategy, when required.
