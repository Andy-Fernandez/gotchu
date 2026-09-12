import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getPublicBookingHref,
  getPublicBookingPageState,
} from "../../modules/scheduling/public-booking-page-state.ts";

const now = new Date("2026-09-14T08:00:00-04:00");

test("booking route preserves a missing service as an explicit pre-selection state", async () => {
  const state = await getPublicBookingPageState({ shopSlug: "demo", now });

  assert.ok(state);
  assert.equal(state.selection.kind, "missing");
  assert.equal(state.selectedDate, "2026-09-14");
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
  assert.equal(state.selection.availability.selection.totalPriceMinorUnits, 500);
  assert.equal(state.selection.availability.selection.serviceDurationMinutes, 10);
  assert.ok(state.selection.availability.slots.length > 0);
  assert.ok(state.selection.availability.slots.every((slot) => slot.barberId === "barber-demo-sam"));
  assert.ok(state.selection.availability.slots.every((slot) => slot.startsAt >= new Date("2026-09-14T10:00:00-04:00")));
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
  assert.equal(invalidDate.selection.kind, "missing");
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
