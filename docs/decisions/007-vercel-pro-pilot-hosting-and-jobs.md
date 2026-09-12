# ADR 007: Vercel Pro hosting and scheduled jobs for the real pilot

- Status: accepted
- Date: 2026-09-12
- Owners: Product founders

## Context

The real pilot will accept customer traffic, personal information, and QR receipt claims. It needs a managed deployment target and recurring server-side work for hold expiry, deposit-review alerts, and retention. The MVP remains a Next.js modular monolith, while PostgreSQL and object storage are separate managed services whose concrete providers are still open.

The pre-client demo must remain safe and inexpensive: it may use local or private non-commercial hosting, fictional data, and disabled minute-level jobs. It must not be mistaken for a commercial production environment or accept real deposits, personal information, or receipt images.

## Decision

Target Vercel Pro for the first real customer pilot, with Vercel Cron invoking server-side job endpoints. Pro is the target configuration, not a contracted or activated service. The current official pricing lists Pro at USD 20/month for the platform base and includes USD 20 of monthly usage credit; usage beyond included credit and applicable taxes may add cost. Confirm current pricing before activation. [Vercel pricing](https://vercel.com/pricing)

The initial schedules are:

- hold expiration and cleanup every minute;
- deposit-review alerts every 10 minutes during operating hours;
- retention cleanup daily.

Vercel's current Cron documentation lists once-per-minute scheduling for Pro and daily-only scheduling for Hobby. Cron invokes a Vercel Function, so function limits and usage pricing apply. [Cron usage and pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing)

Every job is server-side, idempotent, safe under duplicate and overlapping invocations, observable, and protected by an authenticated job boundary. PostgreSQL transactions/locking and domain invariants remain authoritative. Jobs never approve or reject a receipt, record payment, or issue a refund automatically.

Vercel does not automatically retry a failed Cron invocation, and a long-running job can overlap with its next invocation. An application rollback also does not update active Cron configuration automatically. [Managing Cron Jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs) Therefore each job must be retryable by a later invocation, emit logs and alerts, and use durable state/locks rather than relying on delivery exactly once.

Before the first customer, the activation gate is: Pro enabled; one-minute Cron configured; real managed PostgreSQL and private object storage selected and connected; production Google Auth/session integration configured; domain configured; backups and restore process ready; monitoring and spend alerts/cap set; and concurrency/security tests passing. The provider-specific adapters should be activated/configured, not replaced with a second architecture.

## Consequences

- The demo and real pilot share the same application boundaries and provider-adapter interfaces.
- Minute-level hold cleanup is available for the real pilot, while every read/write still treats a hold past its server expiry as inactive if a job is delayed.
- Vercel's scheduling precision and failure behavior are operational constraints, not substitutes for transactional correctness.
- Spend alerts and a conservative cap must be configured before production; Vercel Pro does not constitute a promise of the total hosting bill.
- Additional services—PostgreSQL, object storage, Google Auth/session integration, domain, and monitoring—remain separate pending costs and provider decisions.
- If Cron precision, delivery, cost, or job volume stops fitting the workload, complement it with a durable scheduler/worker or migrate the jobs through a later ADR. Do not silently treat a rollback as a migration rollback.

## Alternatives considered

### Vercel Hobby for the real pilot

Rejected because Hobby is intended for personal, non-commercial use and its Cron schedule is daily-only with less precise timing. It remains suitable only for a pre-client, fictional-data demo. [Vercel pricing](https://vercel.com/pricing) [Cron usage and pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing)

### A separate worker platform from the start

Deferred because the single-shop MVP can begin with small idempotent jobs and one deployment boundary. A separate scheduler or worker remains an explicit migration path if operational evidence requires it.

### Client-side timers or best-effort cleanup

Rejected because browsers are unreliable job runners and expired holds must be inactive according to authoritative server time even when cleanup is delayed.

## Links

- `docs/engineering/architecture.md`
- `docs/business/pilot.md`
- `docs/product/business-rules.md`
- `docs/product/core-workflows.md`
- `docs/decisions/003-nextjs-modular-monolith.md`
- `docs/decisions/006-private-receipt-object-storage.md`
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Vercel Function limits](https://vercel.com/docs/functions/limitations)
