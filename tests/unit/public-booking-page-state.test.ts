import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getPublicBookingHref,
  getPublicBookingPageState,
  getPublicSlotToken,
} from "../../modules/scheduling/public-booking-page-state.ts";

const now = new Date("2026-09-14T08:00:00-04:00");

test("booking route preserves a missing service as an explicit pre-selection state", async () => {
  const state = await getPublicBookingPageState({ shopSlug: "demo", now });

  assert.ok(state);
  assert.equal(state.selection.kind, "missing");
  assert.equal(state.selectedDate, "2026-09-14");
  assert.deepEqual(state.bookingWindow, {
    startsOn: "2026-09-14",
    endsOn: "2026-10-14",
  });
  assert.equal(state.dateOptions.length, 7);
  assert.equal(getPublicBookingHref("demo"), "/barberias/demo/reservar");
});

test("a selected public service is encoded in the booking URL and calculated by the availability engine", async () => {
  const state = await getPublicBookingPageState({
    shopSlug: "demo",
    service: "service-demo-cejas",
    date: "2026-09-14",
    now,
  });

  assert.ok(state);
  assert.equal(getPublicBookingHref("demo", {
    serviceId: "service-demo-cejas",
    date: "2026-09-14",
  }), "/barberias/demo/reservar?service=service-demo-cejas&date=2026-09-14");
  assert.equal(state.selection.kind, "selected");
  if (state.selection.kind !== "selected") return;
  assert.deepEqual(state.selection.serviceIds, ["service-demo-cejas"]);
  assert.equal(state.selection.barberPreference, null);
  assert.equal(state.selection.availability.selection.totalPriceMinorUnits, 500);
  assert.equal(state.selection.availability.selection.serviceDurationMinutes, 10);
  assert.ok(state.selection.availability.slots.length > 0);
  assert.ok(state.selection.availability.slots.every((slot) => slot.barberId === "barber-demo-sam"));
  assert.ok(state.selection.availability.slots.every((slot) => slot.startsAt >= new Date("2026-09-14T10:00:00-04:00")));
});

test("a named barber preference filters advisory availability and is preserved in the URL", async () => {
  const state = await getPublicBookingPageState({
    shopSlug: "demo",
    service: "service-demo-corte",
    barber: "barber-demo-alex",
    date: "2026-09-14",
    now,
  });

  assert.ok(state);
  assert.equal(state.selection.kind, "selected");
  if (state.selection.kind !== "selected") return;
  assert.equal(state.selection.barberPreference, "barber-demo-alex");
  assert.equal(state.selection.barberError, null);
  assert.ok(state.selection.availability.slots.length > 0);
  assert.ok(state.selection.availability.slots.every((slot) => slot.barberId === "barber-demo-alex"));
  assert.equal(
    getPublicBookingHref("demo", {
      serviceId: "service-demo-corte",
      barberId: "barber-demo-alex",
      date: "2026-09-14",
    }),
    "/barberias/demo/reservar?service=service-demo-corte&barber=barber-demo-alex&date=2026-09-14",
  );
});

test("multiple services preserve their order and use common barber eligibility", async () => {
  const state = await getPublicBookingPageState({
    shopSlug: "demo",
    service: ["service-demo-corte", "service-demo-barba"],
    barber: "any",
    date: "2026-09-14",
    now,
  });

  assert.ok(state);
  assert.equal(state.selection.kind, "selected");
  if (state.selection.kind !== "selected") return;
  assert.deepEqual(state.selection.serviceIds, [
    "service-demo-corte",
    "service-demo-barba",
  ]);
  assert.equal(state.selection.availability.selection.totalPriceMinorUnits, 6000);
  assert.equal(state.selection.availability.selection.serviceDurationMinutes, 50);
  assert.equal(state.selection.availability.selection.finalBufferMinutes, 10);
  assert.deepEqual(
    state.selection.availability.selection.eligibleBarberIds,
    ["barber-demo-alex"],
  );
  assert.equal(
    getPublicBookingHref("demo", {
      serviceIds: state.selection.serviceIds,
      barberId: "any",
      date: "2026-09-14",
    }),
    "/barberias/demo/reservar?service=service-demo-corte&service=service-demo-barba&barber=any&date=2026-09-14",
  );
});

test("an ineligible barber cannot constrain the public booking flow", async () => {
  const state = await getPublicBookingPageState({
    shopSlug: "demo",
    service: "service-demo-cejas",
    barber: "barber-demo-alex",
    now,
  });

  assert.ok(state);
  assert.equal(state.selection.kind, "selected");
  if (state.selection.kind !== "selected") return;
  assert.equal(state.selection.barberPreference, null);
  assert.match(state.selection.barberError ?? "", /no está disponible/);
});

test("invalid service and date parameters remain safe and explainable", async () => {
  const invalidService = await getPublicBookingPageState({
    shopSlug: "demo",
    service: "not-a-service",
    now,
  });
  const invalidDate = await getPublicBookingPageState({
    shopSlug: "demo",
    service: "service-demo-corte",
    date: "2026-02-30",
    now,
  });

  assert.ok(invalidService);
  assert.equal(invalidService.selection.kind, "invalid");
  assert.ok(invalidDate);
  assert.equal(invalidDate.dateError, "La fecha indicada no es válida.");
  assert.equal(invalidDate.selectedDate, "2026-09-14");
  assert.equal(invalidDate.selection.kind, "selected");
  if (invalidDate.selection.kind !== "selected") return;
  assert.deepEqual(invalidDate.selection.serviceIds, ["service-demo-corte"]);
  assert.equal(invalidDate.selection.selectedSlot, null);
});

test("a slot is selected only when it exactly matches fresh advisory availability", async () => {
  const available = await getPublicBookingPageState({
    shopSlug: "demo",
    service: "service-demo-cejas",
    date: "2026-09-14",
    now,
  });

  assert.ok(available);
  assert.equal(available.selection.kind, "selected");
  if (available.selection.kind !== "selected") return;
  const slot = available.selection.availability.slots[0];
  assert.ok(slot);

  const selected = await getPublicBookingPageState({
    shopSlug: "demo",
    service: "service-demo-cejas",
    barber: "barber-demo-sam",
    date: "2026-09-14",
    slot: getPublicSlotToken(slot),
    now,
  });

  assert.ok(selected);
  assert.equal(selected.selection.kind, "selected");
  if (selected.selection.kind !== "selected") return;
  assert.equal(selected.selection.slotError, null);
  assert.equal(selected.selection.selectedSlot?.barberId, slot.barberId);
  assert.equal(selected.selection.selectedSlot?.startsAt.getTime(), slot.startsAt.getTime());
  assert.match(
    getPublicBookingHref("demo", {
      serviceId: "service-demo-cejas",
      barberId: "barber-demo-sam",
      date: "2026-09-14",
      slot,
    }),
    /slot=/,
  );
});

test("a slot cannot skip the explicit professional-preference step", async () => {
  const available = await getPublicBookingPageState({
    shopSlug: "demo",
    service: "service-demo-cejas",
    date: "2026-09-14",
    now,
  });

  assert.ok(available);
  assert.equal(available.selection.kind, "selected");
  if (available.selection.kind !== "selected") return;
  const slot = available.selection.availability.slots[0];
  assert.ok(slot);

  const skipped = await getPublicBookingPageState({
    shopSlug: "demo",
    service: "service-demo-cejas",
    date: "2026-09-14",
    slot: getPublicSlotToken(slot),
    now,
  });

  assert.ok(skipped);
  assert.equal(skipped.selection.kind, "selected");
  if (skipped.selection.kind !== "selected") return;
  assert.equal(skipped.selection.selectedSlot, null);
  assert.match(skipped.selection.slotError ?? "", /Elige un profesional/);
});

test("a malformed or stale slot query never becomes a selected slot", async () => {
  const state = await getPublicBookingPageState({
    shopSlug: "demo",
    service: "service-demo-cejas",
    barber: "any",
    date: "2026-09-14",
    slot: "barber-demo-sam|2026-09-14T00:00:00.000Z",
    now,
  });

  assert.ok(state);
  assert.equal(state.selection.kind, "selected");
  if (state.selection.kind !== "selected") return;
  assert.equal(state.selection.selectedSlot, null);
  assert.match(state.selection.slotError ?? "", /ya no está disponible/);
});

test("unknown shops remain absent and a closed day produces no advisory slots", async () => {
  const missingShop = await getPublicBookingPageState({ shopSlug: "unknown", now });
  const closedDay = await getPublicBookingPageState({
    shopSlug: "demo",
    service: "service-demo-corte",
    date: "2026-09-20",
    now,
  });

  assert.equal(missingShop, null);
  assert.ok(closedDay);
  assert.equal(closedDay.selection.kind, "selected");
  if (closedDay.selection.kind !== "selected") return;
  assert.deepEqual(closedDay.selection.availability.slots, []);
});
