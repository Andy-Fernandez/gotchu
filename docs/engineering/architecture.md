# Engineering guide

## Current baseline

The repository uses Next.js 16.3 App Router, React 19.2, TypeScript, Tailwind CSS 4, and pnpm. The modular monolith targets Vercel Pro with Vercel Cron for the first real customer pilot; it has not been activated or contracted. PostgreSQL and private object storage are separate managed services, with concrete providers and access layers still open. Staff identity uses individual Google accounts with shop-scoped memberships and permissions; the concrete auth/session integration remains open.

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
managed relational data + private receipt storage + scheduled server-side jobs
```

Business rules belong in shared domain services, not duplicated across pages, route handlers, or AI prompts.

## Next.js project structure

```text
app/         App Router pages, layouts, Server Actions, and external Route Handlers
components/  reusable UI primitives, layouts, and product presentation patterns
modules/     shop-scoped domain capabilities and typed application operations
server/      provider-specific database, auth, storage, jobs, and observability adapters
tests/       unit, integration, and end-to-end verification
```

Pages and layouts are Server Components by default. Add Client Component boundaries only around interaction or browser APIs. Server Components call application operations directly rather than Gotchu's own HTTP endpoints; UI mutations use thin Server Actions, while webhooks and true external HTTP consumers use Route Handlers.

## Required qualities

- Atomic holds and queue allocations.
- Idempotent receipt submission, payment recording, and completion.
- Expired-hold cleanup that is safe to retry.
- Structured logs and error monitoring.
- Private receipt storage with server-generated names and expiring authorized access.
- Server-authorized direct-to-object-storage uploads for receipt images up to 10 MB. Vercel Functions have a 4.5 MB request/response payload limit, so a receipt must not be proxied through a function.
- Idempotent scheduled jobs for hold expiry, deposit-review alerts, and retention cleanup; jobs must tolerate duplicate and overlapping invocations.
- Daily backups and a tested restore process before expansion.
- A clear online/offline state; do not cache private booking or receipt data in shared browser storage.
- Immutable audit events for financial, permission, policy, and scheduling exceptions.
- Persistent audit events are the source of record; Vercel runtime logs support operations but do not replace audit history.
- Booking writes must snapshot deposit mode/value/applied amount and enforce configurable 24-hour cancellation, 8-hour reschedule, 10-minute lateness, 10-minute combined-service buffer, and 2-hour public online lead-time policies.

## Application boundaries

The exact transport is undecided, but preserve these capabilities:

- **Public booking:** shop/catalog read, availability, hold, booking identity, receipt submission, private status, reschedule, cancellation.
- **Staff:** live board, manual appointment, walk-in, assignment, start, complete, no-show, payment, add-on.
- **Financial review:** pending deposits, approve, approve with difference, reject, refund tracking.
- **Payment verification:** manual receipt review in the MVP; a provider-neutral boundary for future authenticated, idempotent confirmations from a banking service, using the same payment state machine and human-review fallback. No provider is selected yet.
- **Owner:** service/staff/hours/policy configuration, operational metrics, adoption metrics, audit.
- **Platform:** merchant activation and health for founder-led pilot support.

## Hosting, uploads, and jobs

For the real pilot, Vercel Pro is the hosting target and Vercel Cron is the initial scheduler. The pre-client demo may keep minute-level jobs disabled, but server-side reads and writes must still enforce hold expiry from the server clock. PostgreSQL transactions/locking and domain state—not Cron delivery timing—protect capacity and money.

Receipt images are uploaded directly to private object storage using a server-generated key and temporary authorization. The server validates the declared and stored object type/size and records only structured claim metadata in PostgreSQL. This avoids the 4.5 MB Vercel Function payload limit while supporting the 10 MB pilot receipt default. Review access uses short-lived signed URLs for authorized owner/manager actions only.

Vercel Cron does not provide exactly-once delivery: failed invocations are not automatically retried and a slow job can overlap with its next invocation. Job handlers therefore need durable idempotency, transaction/lock protection, structured logs, alerts, and safe reprocessing. Vercel logs are operational evidence only; financial, permission, scheduling, and policy events require persistent audit records.

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

Integration-test concurrency and boundaries: two requests for one slot, expiry versus receipt submission, duplicated payment references, staff deposit exceptions, walk-in FIFO/conflicts, delayed service effects, combined services, cancellation/reschedule thresholds, no-show reuse, add-on fit, idempotent completion, authorization, and AI rejection by authoritative domain rules.

End-to-end test the full stories: direct-link deposit-backed customer reservation, busy Saturday queue, manually captured WhatsApp appointment, cash walk-in completion, reschedule with deposit transfer, no-show, owner metrics, and shop activation.

Pilot-test poor connectivity, low-end phones, upload retry, absent approvers, one-person busy periods, forgotten completion, and attempts to keep a hidden paper queue.

## Decision points still open

Create ADRs before committing to:

- PostgreSQL provider and data-access layer.
- Google Auth/session integration.
- Private object-storage provider.
- Analytics and monitoring providers.
- AI model/provider and tool framework.
- Future automatic banking-confirmation provider and webhook/reconciliation model.
- Future marketplace providers: map rendering, geocoding, place search, and geospatial storage/query strategy.
