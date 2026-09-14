import assert from "node:assert/strict";
import { test } from "node:test";

import type { AvailableSlot } from "../../modules/scheduling/availability.ts";
import {
  createPublicTimePickerOptions,
} from "../../modules/scheduling/public-time-picker-options.ts";

test("time picker options deduplicate starts across barbers and preserve their count", () => {
  const result = createPublicTimePickerOptions([
    slot("barber-alex", "2026-09-14T10:15:00-04:00"),
    slot("barber-sam", "2026-09-14T10:15:00-04:00"),
    slot("barber-sam", "2026-09-14T14:00:00-04:00"),
  ]);

  assert.deepEqual(result.periodGroups.map((group) => group.label), [
    "Mañana",
    "Tarde",
    "Noche",
  ]);
  assert.deepEqual(
    result.periodGroups.flatMap((group) => group.options).map((option) => ({
      label: option.label,
      professionalCount: option.professionalCount,
    })),
    [
      { label: "10:15", professionalCount: 2 },
      { label: "14:00", professionalCount: 1 },
    ],
  );
  assert.equal(result.periodGroups[2].options.length, 0);
});

test("quick options show one chronological start from each available period", () => {
  const result = createPublicTimePickerOptions([
    slot("barber-alex", "2026-09-14T18:00:00-04:00"),
    slot("barber-alex", "2026-09-14T14:00:00-04:00"),
    slot("barber-alex", "2026-09-14T10:15:00-04:00"),
    slot("barber-alex", "2026-09-14T10:30:00-04:00"),
  ]);

  assert.deepEqual(result.quickOptions.map((option) => option.label), [
    "10:15",
    "14:00",
    "18:00",
  ]);
});

test("quick options fill with the earliest unique starts when only one period is available", () => {
  const result = createPublicTimePickerOptions([
    slot("barber-alex", "2026-09-14T10:15:00-04:00"),
    slot("barber-sam", "2026-09-14T10:15:00-04:00"),
    slot("barber-alex", "2026-09-14T10:30:00-04:00"),
    slot("barber-alex", "2026-09-14T10:45:00-04:00"),
    slot("barber-alex", "2026-09-14T11:00:00-04:00"),
  ]);

  assert.deepEqual(result.quickOptions.map((option) => option.label), [
    "10:15",
    "10:30",
    "10:45",
  ]);
});

test("period boundaries use the shop-local time in La Paz", () => {
  const result = createPublicTimePickerOptions([
    slot("barber-alex", "2026-09-14T11:45:00-04:00"),
    slot("barber-alex", "2026-09-14T12:00:00-04:00"),
    slot("barber-alex", "2026-09-14T17:45:00-04:00"),
    slot("barber-alex", "2026-09-14T18:00:00-04:00"),
  ]);

  assert.deepEqual(
    result.periodGroups.map((group) => ({
      label: group.label,
      times: group.options.map((option) => option.label),
    })),
    [
      { label: "Mañana", times: ["11:45"] },
      { label: "Tarde", times: ["12:00", "17:45"] },
      { label: "Noche", times: ["18:00"] },
    ],
  );
});

function slot(barberId: string, startsAt: string): AvailableSlot {
  const start = new Date(startsAt);

  return {
    barberId,
    startsAt: start,
    serviceEndsAt: new Date(start.getTime() + 30 * 60_000),
    protectedEndsAt: new Date(start.getTime() + 35 * 60_000),
  };
}
