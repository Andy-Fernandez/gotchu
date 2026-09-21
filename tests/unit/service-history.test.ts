import assert from "node:assert/strict";
import { test } from "node:test";

import {
  formatBobMinorUnits,
  formatServiceDate,
  formatServiceTime,
  getServiceHistoryStatusPresentation,
} from "../../components/history/service-history-formatters.ts";
import { demoServiceHistory } from "../../modules/operations/demo-service-history.ts";
import {
  countServiceHistory,
  createServiceHistoryReader,
  filterServiceHistory,
  getServiceHistory,
  getServiceHistoryRecord,
  parseServiceHistoryFilter,
} from "../../modules/operations/get-service-history.ts";
import type { ServiceHistoryRecord } from "../../modules/operations/service-history-types.ts";

test("maps the three requested views to exact domain states and semantic tones", () => {
  assert.deepEqual(
    getServiceHistoryStatusPresentation("reserved_pending_review"),
    {
      label: "Pendiente de revisión",
      shortLabel: "Pendiente",
      description: "El anticipo fue enviado y aún requiere revisión humana.",
      tone: "warning",
    },
  );
  assert.equal(
    getServiceHistoryStatusPresentation("confirmed").tone,
    "information",
  );
  assert.equal(
    getServiceHistoryStatusPresentation("confirmed").label,
    "Confirmado",
  );
  assert.equal(
    getServiceHistoryStatusPresentation("completed").tone,
    "success",
  );
  assert.equal(
    getServiceHistoryStatusPresentation("completed").label,
    "Realizado",
  );
});

test("parses known filters and safely falls back to all records", () => {
  assert.equal(parseServiceHistoryFilter("pendientes"), "pendientes");
  assert.equal(parseServiceHistoryFilter(["realizados", "confirmados"]), "realizados");
  assert.equal(parseServiceHistoryFilter("unknown"), "todos");
  assert.equal(parseServiceHistoryFilter(undefined), "todos");
});

test("counts and filters records without changing the source snapshots", () => {
  const source = structuredClone(demoServiceHistory);
  const original = structuredClone(source);

  assert.deepEqual(countServiceHistory(source), {
    todos: 6,
    pendientes: 2,
    confirmados: 2,
    realizados: 2,
  });
  assert.deepEqual(
    filterServiceHistory(source, "pendientes").map((record) => record.id),
    ["booking-demo-1054", "booking-demo-1052"],
  );
  assert.ok(
    filterServiceHistory(source, "realizados").every(
      (record) => record.bookingStatus === "completed",
    ),
  );

  const filtered = filterServiceHistory(source, "todos");
  filtered[0].customerName = "Changed";
  filtered[0].items[0].name = "Changed";
  assert.deepEqual(source, original);
});

test("reader scopes by shop, sorts newest scheduled start first, and uses id as tie-breaker", async () => {
  const base = structuredClone(demoServiceHistory[0]);
  const records: ServiceHistoryRecord[] = [
    {
      ...base,
      id: "booking-b",
      shopId: "shop-a",
      scheduledStart: "2026-09-18T10:00:00-04:00",
    },
    {
      ...base,
      id: "booking-a",
      shopId: "shop-a",
      scheduledStart: "2026-09-18T10:00:00-04:00",
    },
    {
      ...base,
      id: "booking-newest",
      shopId: "shop-a",
      scheduledStart: "2026-09-19T10:00:00-04:00",
    },
    { ...base, id: "booking-foreign", shopId: "shop-b" },
  ];
  const reader = createServiceHistoryReader(records);

  assert.deepEqual(
    (await reader.list("shop-a")).map((record) => record.id),
    ["booking-newest", "booking-a", "booking-b"],
  );
  assert.equal(await reader.find("shop-a", "booking-foreign"), null);
  assert.equal(await reader.find("shop-a", "missing"), null);
});

test("reader returns detached records for list and detail reads", async () => {
  const reader = createServiceHistoryReader(demoServiceHistory);
  const firstList = await reader.list("shop-demo");
  const firstDetail = await reader.find("shop-demo", "booking-demo-1054");

  assert.ok(firstDetail);
  firstList[0].customerName = "Changed";
  firstList[0].items[0].name = "Changed";
  firstDetail.customerName = "Changed";

  const secondList = await reader.list("shop-demo");
  const secondDetail = await reader.find("shop-demo", "booking-demo-1054");

  assert.equal(secondList[0].customerName, "Valeria Quispe");
  assert.equal(secondList[0].items[0].name, "Corte de pelo normal");
  assert.equal(secondDetail?.customerName, "Valeria Quispe");
});

test("application operations expose sorted demo records and a nullable detail", async () => {
  const records = await getServiceHistory();

  assert.equal(records.length, 6);
  assert.equal(records[0].id, "booking-demo-1054");
  assert.equal(
    (await getServiceHistoryRecord("booking-demo-1050"))?.bookingStatus,
    "completed",
  );
  assert.equal(await getServiceHistoryRecord("unknown"), null);
});

test("formats money from integer minor units and dates in the La Paz timezone", () => {
  assert.equal(formatBobMinorUnits(0).replaceAll("\u00a0", " "), "Bs 0");
  assert.equal(formatBobMinorUnits(4550).replaceAll("\u00a0", " "), "Bs 45,5");

  const instantThatChangesDayInLaPaz = "2026-09-15T01:30:00Z";
  assert.equal(
    formatServiceDate(instantThatChangesDayInLaPaz),
    "lunes, 14 de septiembre",
  );
  assert.equal(formatServiceTime(instantThatChangesDayInLaPaz), "21:30");
});

test("demo records preserve service, money, completion, and execution invariants", () => {
  for (const record of demoServiceHistory) {
    assert.ok(record.items.length > 0);
    assert.ok(record.items.every((item) => Number.isSafeInteger(item.priceMinorUnits)));
    assert.equal(
      record.items.reduce((total, item) => total + item.priceMinorUnits, 0),
      record.totalMinorUnits,
    );
    assert.ok(Number.isSafeInteger(record.depositAppliedMinorUnits));
    assert.ok(record.depositAppliedMinorUnits >= 0);
    assert.ok(record.depositAppliedMinorUnits <= record.totalMinorUnits);
    assert.equal(
      record.totalMinorUnits - record.depositAppliedMinorUnits,
      record.remainingBalanceMinorUnits,
    );

    if (record.bookingStatus === "completed") {
      assert.equal(record.executionStatus, "completed");
      assert.equal(record.paymentStatus, "paid");
      assert.ok(record.completedAt);
      assert.ok(record.actualStart);
      assert.ok(record.actualEnd);
      assert.ok(record.paymentMethod);
      assert.equal(record.finalAmountMinorUnits, record.totalMinorUnits);
    } else {
      assert.equal(record.executionStatus, "not_started");
    }
  }
});
