# Product brief

## Product decision

Gotchu begins as the Bolivia-native operating system for appointments, walk-ins, live queues, and QR-secured services for one barbershop. The intended evolution is a local marketplace where customers can discover nearby shops through maps and book against the same trustworthy operational data.

The first question is whether one barbershop will run most of its real daily work through the system because it is more dependable than memory, paper, and disconnected WhatsApp chats. Customer discovery across multiple shops is a later hypothesis, tested only after the closed single-shop flow works.

## Problem

Barbershops lose demand and operational control because online requests, WhatsApp conversations, phone bookings, and physical walk-ins are managed separately. This creates false availability, double bookings, uncertain queues, no-shows, and limited owner visibility. Later, Gotchu will also address the difficulty customers have comparing nearby shops using location, services, prices, and availability they can trust.

## Target merchant

An owner-operated, single-location barbershop that:

- Already receives meaningful demand through WhatsApp and walk-ins.
- Has multiple barbers where possible.
- Feels scheduling or queue friction.
- Will standardize services and daily operations.
- Has an owner or manager accountable for adoption.
- Will actively share the public booking link.

Avoid shops with almost no demand, no operational champion, or an unwillingness to register appointments and walk-ins.

## Target customer

A mobile-first customer who already reached the participating shop through its shared link or QR and values clear services, pricing, trustworthy availability, and reservation priority.

## Product promise

Customer:

```text
Open the barbershop's direct link or QR → see services and trustworthy availability
→ reserve with a small QR deposit
→ receive a clear status → arrive with priority → pay the balance
```

Staff:

```text
Capture every demand source → operate one live schedule
→ protect commitments → manage the queue → record completion and payment
```

Owner:

```text
See today's reality → reduce no-shows and confusion
→ understand demand and capacity → retain operational history
```

## Jobs to be done

Customers need to understand services, prices, durations, real availability, reservation status, queue expectations, and cancellation or rescheduling rules.

Barbers need to see who is next, know who has priority, register a walk-in quickly, avoid conflicts, and start or complete work with minimal tapping.

Owners and managers need to capture all demand, review deposits, see the live day, detect weak adoption, and measure operational value.

In a later marketplace phase, customers will also need to search an area, compare shops, and move from discovery to this same reservation flow without encountering a second or stale scheduling system.

## Definition of success

North-star metric:

> Completed platform-captured services per active shop per month.

Critical adoption metric:

```text
schedule capture ratio =
completed services recorded in Gotchu / estimated services actually performed
```

Online bookings alone are insufficient. A shop is deeply adopted only when most appointments, walk-ins, services, and deposits pass through Gotchu.

Marketplace discovery metrics are deferred until more than one operationally ready shop can be published. The first MVP measures direct-link booking completion and real operational adoption.

## Product principles

1. One operational truth for every demand source.
2. The single-shop customer and business journeys must close completely before discovery expands.
3. Future marketplace discovery must reuse real merchant data and the same booking domain, not a parallel catalog.
4. Service before availability.
5. Availability represents actual occupied capacity.
6. Confirmed appointments have priority over walk-ins.
7. A deposit creates commitment and is part of the final price.
8. Staff interaction must stay fast during busy periods.
9. Humans may handle rare exceptions with an audit note.
10. AI understands language; deterministic software enforces reality.

## Feature test

Before adding a feature, ask whether it improves schedule capture, merchant activation or retention, no-shows, coordination time, availability trust, or reusable operational learning. If it does none of these and a rare case can be handled manually, it does not belong in the current MVP.
