# Documentation map

This is the working knowledge base for Gotchu. It distills the durable, actionable parts of the 2,271-line *Barbershop Local Operating System — Strategic Lean MVP Guide v0.4* (August 1, 2026).

The original memo mixed product strategy, operations, implementation ideas, market evidence, and long-range company thinking. These docs keep what helps the current MVP and deliberately defer the rest.

## Reading paths

| If you are working on… | Read |
|---|---|
| Any task | `AGENTS.md`, then this page |
| Product UX or priority | `product/brief.md`, `product/mvp-scope.md` |
| Future marketplace, maps, or expansion readiness | `product/marketplace.md` |
| Booking, queue, deposit, or staff flows | `product/core-workflows.md`, `domain/domain-model.md` |
| Detailed policies, permissions, failures, audit, or operational rules | `product/business-rules.md` |
| Data, APIs, concurrency, security, testing | `engineering/architecture.md`, `domain/domain-model.md` |
| Pilot operations, analytics, or go-to-market | `business/pilot.md` |
| A durable technical or product choice | `decisions/README.md` |

## Sources of truth

Use this precedence when documents or implementation disagree:

1. A current, explicit user decision.
2. Accepted ADRs in `docs/decisions/`.
3. Product and domain documentation in this directory.
4. Current tested behavior.
5. The original strategy memo.

If tested behavior conflicts with a documented product invariant, flag the conflict rather than treating the bug as the new requirement.

## What was retained

- Product positioning, target merchant and customer, single-shop MVP, future marketplace direction, jobs to be done, and success definition.
- MVP inclusions and exclusions.
- Booking, QR deposit, manual appointment, queue, and service-completion workflows.
- Availability, concurrency, money, state, permissions, privacy, and AI guardrails.
- Pilot phases, activation, metrics, and expansion gates.

## What was intentionally left out

- Repeated rationale and examples already captured by a rule.
- Time-sensitive competitor, investment, and payment-market claims.
- Speculative acquisition scenarios and long-range moat language.
- Exhaustive endpoint and table proposals before infrastructure decisions are made.
- Features still explicitly outside the revised MVP.

Omitted material is not rejected forever. It should return only when evidence or a deliberate scope decision makes it relevant.

## Maintenance rules

- Keep each document focused and link instead of duplicating rules.
- Record decisions, not meeting transcripts.
- Label unvalidated numbers as hypotheses.
- Change docs alongside product behavior.
- Prefer short examples that clarify an invariant; avoid turning docs into code copies.
