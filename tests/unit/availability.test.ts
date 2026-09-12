import assert from "node:assert/strict";
import { test } from "node:test";

import { demoCatalog } from "../../modules/catalog/demo-catalog.ts";
import {
  calculatePublicAvailability,
  intervalsOverlap,
  type CalculatePublicAvailabilityInput,
} from "../../modules/scheduling/availability.ts";

const monday = "2026-09-14" as const;
const policy = { slotIntervalMinutes: 15, combinedServiceBufferMinutes: 10 } as const;

function atLaPaz(time: string): Date {
  return new Date(`2026-09-14T${time}:00-04:00`);
}

function availabilityInput(
  overrides: Partial<CalculatePublicAvailabilityInput> = {},
): CalculatePublicAvailabilityInput {
  return {
    catalog: demoCatalog,
    shopId: "shop-demo",
    serviceIds: ["service-demo-corte"],
    date: monday,
    barberWorkingHours: [
      { barberId: "barber-demo-alex", dayOfWeek: 1, startsAt: "09:00", endsAt: "19:00" },
      { barberId: "barber-demo-sam", dayOfWeek: 1, startsAt: "09:00", endsAt: "19:00" },
    ],
    protectedIntervals: [],
    blockedPeriods: [],
    policy,
    ...overrides,
  };
}

function utcTimes(slots: ReturnType<typeof calculatePublicAvailability>["slots"]): string[] {
  return slots.map((slot) => slot.startsAt.toISOString().slice(11, 16));
}

test("combined services use one eligible barber, summed duration, and one final buffer", () => {
  const result = calculatePublicAvailability(availabilityInput({
    serviceIds: ["service-demo-corte", "service-demo-barba"],
  }));

  assert.deepEqual(result.selection, {
    serviceIds: ["service-demo-corte", "service-demo-barba"],
    totalPriceMinorUnits: 6000,
    serviceDurationMinutes: 50,
    finalBufferMinutes: 10,
    protectedDurationMinutes: 60,
    eligibleBarberIds: ["barber-demo-alex"],
  });
  assert.ok(result.slots.length > 0);
  assert.ok(result.slots.every((slot) => slot.barberId === "barber-demo-alex"));
  assert.ok(result.slots.every(
    (slot) => slot.serviceEndsAt.getTime() - slot.startsAt.getTime() === 50 * 60_000 &&
      slot.protectedEndsAt.getTime() - slot.startsAt.getTime() === 60 * 60_000,
  ));
});

test("eligibility is the active intersection of every selected service", () => {
  const result = calculatePublicAvailability(availabilityInput({
    serviceIds: ["service-demo-cejas"],
  }));

  assert.deepEqual(result.selection.eligibleBarberIds, ["barber-demo-sam"]);
  assert.ok(result.slots.length > 0);
  assert.ok(result.slots.every((slot) => slot.barberId === "barber-demo-sam"));

  const unavailablePreference = calculatePublicAvailability(availabilityInput({
    serviceIds: ["service-demo-cejas"],
    barberPreference: "barber-demo-alex",
  }));
  assert.deepEqual(unavailablePreference.slots, []);
});

test("candidate protected intervals never overlap existing protected capacity, including its buffer", () => {
  const input = availabilityInput({
    barberPreference: "barber-demo-alex",
    protectedIntervals: [{
      barberId: "barber-demo-alex",
      startsAt: atLaPaz("09:30"),
      // A preceding 30-minute service includes its five-minute final buffer.
      endsAt: atLaPaz("10:05"),
    }],
  });
  const result = calculatePublicAvailability(input);
  const existing = input.protectedIntervals[0];

  assert.ok(result.slots.every((slot) => !intervalsOverlap(existing, {
    startsAt: slot.startsAt,
    endsAt: slot.protectedEndsAt,
  })));
  assert.equal(utcTimes(result.slots).includes("13:00"), false); // 09:00 La Paz overlaps to 09:35.
  assert.equal(utcTimes(result.slots).includes("14:00"), false); // 10:00 La Paz overlaps to 10:35.
  assert.equal(utcTimes(result.slots).includes("14:15"), true); // 10:15 La Paz is the next cadence start.
});

test("shop blocks and barber breaks remove capacity without affecting another barber", () => {
  const result = calculatePublicAvailability(availabilityInput({
    blockedPeriods: [
      { scope: "shop", startsAt: atLaPaz("11:00"), endsAt: atLaPaz("11:30") },
      {
        scope: "barber",
        barberId: "barber-demo-alex",
        startsAt: atLaPaz("13:00"),
        endsAt: atLaPaz("14:00"),
      },
    ],
  }));

  for (const slot of result.slots) {
    const candidate = { startsAt: slot.startsAt, endsAt: slot.protectedEndsAt };
    assert.equal(intervalsOverlap(candidate, { startsAt: atLaPaz("11:00"), endsAt: atLaPaz("11:30") }), false);
    if (slot.barberId === "barber-demo-alex") {
      assert.equal(intervalsOverlap(candidate, { startsAt: atLaPaz("13:00"), endsAt: atLaPaz("14:00") }), false);
    }
  }
  assert.ok(result.slots.some((slot) =>
    slot.barberId === "barber-demo-sam" && slot.startsAt.getTime() === atLaPaz("13:00").getTime(),
  ));
});

test("the complete protected duration must fit before shop and barber schedule boundaries", () => {
  const catalog = structuredClone(demoCatalog);
  catalog.shops[0].openingHours = [
    { dayOfWeek: 1, opensAt: "09:00", closesAt: "10:00" },
  ];
  const result = calculatePublicAvailability(availabilityInput({
    catalog,
    barberPreference: "barber-demo-alex",
    barberWorkingHours: [
      { barberId: "barber-demo-alex", dayOfWeek: 1, startsAt: "09:00", endsAt: "10:00" },
    ],
  }));

  assert.deepEqual(utcTimes(result.slots), ["13:00", "13:15"]);
  assert.ok(result.slots.every((slot) => slot.protectedEndsAt <= atLaPaz("10:00")));
});

test("a false gap around a break is not offered; half-open boundaries remain valid", () => {
  const result = calculatePublicAvailability(availabilityInput({
    barberPreference: "barber-demo-alex",
    barberWorkingHours: [
      { barberId: "barber-demo-alex", dayOfWeek: 1, startsAt: "09:00", endsAt: "11:00" },
    ],
    blockedPeriods: [{
      scope: "barber",
      barberId: "barber-demo-alex",
      startsAt: atLaPaz("09:30"),
      endsAt: atLaPaz("10:00"),
    }],
  }));

  assert.deepEqual(utcTimes(result.slots), ["14:00", "14:15"]);
  assert.equal(
    intervalsOverlap(
      { startsAt: atLaPaz("09:30"), endsAt: atLaPaz("10:00") },
      { startsAt: atLaPaz("10:00"), endsAt: atLaPaz("10:35") },
    ),
    false,
  );
});

test("an empty date override closes the shop and produces no slots", () => {
  const result = calculatePublicAvailability(availabilityInput({
    shopDateOverrides: [{ date: monday, openingHours: [] }],
  }));

  assert.deepEqual(result.slots, []);
});
