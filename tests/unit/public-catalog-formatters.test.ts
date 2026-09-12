import assert from "node:assert/strict";
import { test } from "node:test";

import {
  formatBobMinorUnits,
  getEligibleBarberNames,
  getOpeningHoursRows,
} from "../../components/catalog/public-catalog-formatters.ts";

test("formats integer minor units as BOB at the UI boundary", () => {
  assert.equal(formatBobMinorUnits(0).replaceAll("\u00a0", " "), "Bs 0");
  assert.equal(formatBobMinorUnits(4500).replaceAll("\u00a0", " "), "Bs 45");
  assert.equal(formatBobMinorUnits(4550).replaceAll("\u00a0", " "), "Bs 45,5");
});

test("builds a complete Monday-to-Sunday schedule and marks omitted days closed", () => {
  const rows = getOpeningHoursRows([
    { dayOfWeek: 6, opensAt: "09:00", closesAt: "17:00" },
    { dayOfWeek: 1, opensAt: "09:00", closesAt: "19:00" },
  ]);

  assert.equal(rows.length, 7);
  assert.deepEqual(rows[0], {
    dayOfWeek: 1,
    label: "Lunes",
    hours: "09:00–19:00",
    isClosed: false,
  });
  assert.deepEqual(rows[1], {
    dayOfWeek: 2,
    label: "Martes",
    hours: "Cerrado",
    isClosed: true,
  });
  assert.equal(rows[5].label, "Sábado");
  assert.equal(rows[6].label, "Domingo");
});

test("resolves only explicitly eligible published barber names", () => {
  const barbers = [
    { id: "alex", shopId: "shop", displayName: "Alex" },
    { id: "sam", shopId: "shop", displayName: "Sam" },
  ];

  assert.deepEqual(
    getEligibleBarberNames(
      { eligibleBarberIds: ["sam", "missing", "alex"] },
      barbers,
    ),
    ["Sam", "Alex"],
  );
  assert.deepEqual(
    getEligibleBarberNames({ eligibleBarberIds: [] }, barbers),
    [],
  );
});
