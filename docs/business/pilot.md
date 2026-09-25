# Pilot and success measures

This document contains operating hypotheses for the closed single-shop pilot. Marketplace discovery and maps are a later expansion phase. Numeric targets are learning thresholds, not promises.

## Rollout

```text
one anchor shop → 5–10 nearby shops in one microzone
→ one city → another city → broader expansion
```

Choose the anchor shop by founder access, meaningful demand, operational friction, willingness to pilot, and ability to adopt the full workflow—not prestige.

## Phase 0: field discovery

Before implementation hardens assumptions:

- Observe one normal day and one busy Saturday.
- Map actual WhatsApp, phone, booking, and walk-in behavior.
- Estimate total services and capture baseline no-shows and queue friction.
- Validate catalog, durations, buffers, deposit amounts, and policies.
- Identify the owner accountable for adoption and a staff champion.
- Secure an anchor commitment and define before/after evidence.

## Phase 1: pre-client demo

The demo exercises the same modular monolith and provider-adapter boundaries intended for the pilot, but it is not a commercial environment. Use local or private non-commercial hosting, fictional shop/customer/staff data, and no real deposits, personal information, or receipt images. Minute-level jobs may remain disabled; authoritative reads and writes must still treat an expired hold as inactive.

The demo is complete when the direct-link booking, one shared schedule, manual appointment, walk-in/queue, service execution, and human receipt-review paths can be exercised with test data and the activation gaps below are known.

## Phase 2: real pilot from the first customer

Do not accept the first real customer until the activation gate is met. The pilot target is Vercel Pro, with Vercel Cron configured for minute-level hold expiry/cleanup, ten-minute deposit-review alerts during operating hours, and daily retention cleanup. Pro is a target, not an activated or contracted service.

### Activation gate

- Vercel Pro enabled, with spend alerts and a conservative cap configured.
- PostgreSQL and private object storage selected, provisioned, backed up, and connected through server-side adapters.
- Production Google Auth/session integration configured for individual staff accounts and shop-scoped memberships.
- Production domain configured.
- Backup and tested restore process ready.
- Monitoring, alert routing, and persistent audit verification ready.
- Concurrency, authorization, security, upload, expiry, and idempotency tests passing.
- Owner and staff champion trained on the one shared schedule, receipt review, queue, and recovery paths.

This is a configuration and activation step over the demo architecture, not a reimplementation. Costs for services whose providers are not yet chosen remain open.

## Anchor activation

An account is not an activated shop. Activation includes services and eligibility, hours, existing commitments, QR, deposit policy, owner and staff champion, direct public link placement, Saturday queue training, one completed customer booking, and one completed walk-in.

Build in this order:

1. Shop configuration, public page, roles, availability, atomic holds, booking, receipt, and human approval.
2. Manual appointments, queue, live board, execution, final payment, no-show, and capture metrics.
3. Saturday hardening, audit, abuse controls, events, health view, and evidence collection.
4. Narrow AI assistance only after the deterministic flow is stable and its value can be measured.

## Cost envelope

These are planning entries, not a promise of total operating cost. Confirm current prices, taxes, usage, and billing terms before activation.

| Service                         | Pilot planning status             | Cost recorded now                                                                                                    |
| ------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Vercel Pro                      | Target for the real pilot         | USD 20/month platform base, with USD 20/month included usage credit; additional usage and applicable taxes may apply |
| Managed PostgreSQL              | Provider not selected             | Pending provider and capacity decision                                                                               |
| Private object storage          | Provider not selected             | Pending provider, retention, and volume decision                                                                     |
| Google Auth/session integration | Integration/provider details open | Pending implementation and any applicable service cost                                                               |
| Production domain               | Not selected                      | Pending registrar/domain decision                                                                                    |
| Monitoring/alerts               | Provider not selected             | Pending provider and volume decision                                                                                 |

The pre-client demo uses no money and no real personal data. A total monthly cost is intentionally not stated until the pending services are selected.

## Scorecard

Primary metric: completed platform-captured services per active shop per month.

Critical adoption metric: schedule capture ratio. The anchor starting target is above 80%, subject to calibration with real measurement.

Also track:

- Direct-link page-to-availability and booking completion.
- Zero preventable double bookings.
- Weekly active staff and time per entry.
- Hold-to-receipt and receipt-to-approval conversion.
- Deposit review time, rejection, abandonment, and exception rates.
- No-shows for deposit-backed bookings versus bypasses.
- Queue estimate median and 90th-percentile error.
- Customer completion, cancellation, reschedule, and repeat behavior.
- Owner-reported value and founder support minutes.

Do not report page views, accounts, downloads, followers, total shops created, or uncompleted bookings without connecting them to completion, retention, or revenue.

## Anchor exit gate

Move to a nearby cohort only when customers can complete the direct-link booking journey, most real work is captured, availability remains trustworthy, the Saturday queue is used, commitments stay protected, staff does not need constant founder correction, no critical scheduling defect remains, the owner can name concrete value, and a real paid offer is accepted or explicitly committed to.

## Density cohort

Start with a hypothesis of 5–10 active nearby locations. First validate repeatable activation, retention, pricing, referrals, declining support cost, and a shared configurable core without shop-specific code. This cohort creates the supply base for a later marketplace and map pilot.

Begin marketplace implementation only when the closed flow is reliable and multiple nearby shops can provide useful supply. Then define separate discovery, geographic coverage, and marketplace conversion experiments.

Test pricing with real offers: a simple location subscription, a Core/Pro subscription, or—only after legal and operational validation—a lower subscription plus transaction service. Do not settle pricing from surveys alone.

## Stop signals

Pause expansion if shops keep a hidden schedule, staff refuses to register walk-ins, receipt review creates excessive work, founders correct data daily, availability is frequently wrong, shops require custom code, retention or willingness to pay is weak, acquisition effort is unsustainable, or AI creates more corrections than time saved.

Expansion is earned by retention, high schedule capture, paid conversion, lower onboarding effort, stable scheduling, and repeatable acquisition.
