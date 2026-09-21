<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Gotchu agent guide

## Mission

Build a mobile-first operating system for Bolivian barbershops that can later evolve into a local marketplace with map-based discovery. The initial MVP closes the complete customer and business flow for one barbershop: customers arrive through that shop's direct link or QR, and staff operate online bookings, manual appointments, walk-ins, queue allocation, service execution, and QR deposit review in one trustworthy schedule.

Marketplace and maps are an explicit product direction, but not part of the first implementation scope. Preserve clean boundaries that allow multiple published shops and discovery later without building speculative marketplace infrastructure now. Do not turn the MVP into a broad business-management suite.

## Read only what the task needs

Start with `docs/README.md`, then load the smallest relevant set:

- Product behavior or prioritization: `docs/product/brief.md` and `docs/product/mvp-scope.md`
- Visual design, tokens, responsive UI, shared components, or accessibility defaults: `docs/product/design-system.md`
- Future marketplace, maps, ranking, or expansion readiness: `docs/product/marketplace.md`
- Booking, deposit, queue, or service flow: `docs/product/core-workflows.md`
- Operational policies, permissions, failure handling, or business-rule edge cases: `docs/product/business-rules.md`
- Entities, states, permissions, or invariants: `docs/domain/domain-model.md`
- Architecture, security, APIs, or tests: `docs/engineering/architecture.md`
- Pilot, metrics, activation, or pricing: `docs/business/pilot.md`
- A decision that changes product or architecture: `docs/decisions/README.md`

Do not load every document by default. The repository documentation is the working source of truth; the original long strategy memo is background material, not a task specification.

## Non-negotiable product rules

- All demand sources share one schedule. Never create a separate path for online, WhatsApp, phone, or walk-in work.
- The first customer entry point is a direct shop link or QR; do not add marketplace search, ranking, map views, or customer geolocation to the initial MVP.
- Keep shop identity, catalog, public profile, availability, and booking operations scoped cleanly so a future marketplace can reuse them without creating a second booking system.
- When maps are eventually implemented, location must remain optional for customers and shop pins must be merchant-verified.
- Service selection determines duration, buffer, eligible barbers, price, and deposit.
- Availability is calculated and revalidated by deterministic backend code.
- Holds and queue allocations are atomic; overlapping protected intervals must be impossible.
- A submitted QR receipt is a claim awaiting human review, not proof of payment.
- Confirmed appointments have priority over walk-ins.
- Preserve historical records when rescheduling or reversing actions; use explicit state transitions and audit sensitive changes.
- AI may interpret language and propose actions. It must use controlled domain operations, ask for confirmation before writes, and never invent availability, approve money, bypass permissions, or write directly to the database.
- Store money as integer minor units and time as timezone-aware values. The initial shop timezone is `America/La_Paz`.
- Prefer configuration shared by the target segment over one-off code for a single shop.

## Delivery discipline

- Never create a branch whose name starts with `codex/`. Use a descriptive prefix such as `feature/`, `fix/`, or `chore/` instead.
- Keep the complete core journey working before adding exceptional automation.
- Treat the “Outside the MVP” list as a hard boundary unless the user explicitly changes scope.
- Add or update tests for scheduling, money, permissions, and state-transition behavior.
- When a choice materially changes product rules or architecture, add an ADR using `docs/decisions/000-template.md`.
- Update the relevant documentation in the same change when behavior or a durable decision changes.
- Do not state that an action succeeded until the authoritative backend result confirms it.

## Current implementation context

- Next.js 16.3 App Router
- React 19.2
- TypeScript
- Tailwind CSS 4
- pnpm

No database, authentication, storage, analytics, AI provider, or deployment provider has been selected yet. Do not silently assume one.
