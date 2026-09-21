import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createDemoPrivateBookingAccessToken,
  getBookingStatusPresentation,
  getDemoBookingStatusHref,
  getDemoBookingSubmissionHref,
  readDemoPrivateBookingAccessToken,
  resolveDemoBookingStatus,
  type CreateDemoPrivateBookingInput,
} from "../../modules/booking/demo-private-booking.ts";

const booking: CreateDemoPrivateBookingInput = {
  shopSlug: "demo",
  shopName: "Barbería Demo Gotchu",
  shopAddress: "Dirección ficticia, La Paz, Bolivia",
  timeZone: "America/La_Paz",
  serviceName: "Corte de pelo normal",
  professionalName: "Alex (demo)",
  startsAt: "2026-09-14T14:00:00.000Z",
  serviceEndsAt: "2026-09-14T14:30:00.000Z",
  durationMinutes: 30,
  totalPriceMinorUnits: 4_500,
  depositMinorUnits: 1_000,
  balanceMinorUnits: 3_500,
  bookingCode: "GOT-DEMO-260914-1000",
  policySummary: "Política ficticia de demostración.",
};

test("a fictional booking snapshot round-trips through the demo-only access token", () => {
  const accessToken = createDemoPrivateBookingAccessToken(booking);

  assert.match(accessToken, /^demo\.[A-Za-z0-9_-]+$/);
  assert.deepEqual(readDemoPrivateBookingAccessToken(accessToken), {
    schemaVersion: 1,
    ...booking,
  });
  assert.equal(
    getDemoBookingSubmissionHref(accessToken),
    `/reserva/${encodeURIComponent(accessToken)}/solicitud-enviada`,
  );
  assert.equal(
    getDemoBookingStatusHref(accessToken),
    `/reserva/${encodeURIComponent(accessToken)}`,
  );
  assert.equal(
    getDemoBookingStatusHref(accessToken, "confirmed"),
    `/reserva/${encodeURIComponent(accessToken)}?estado=confirmada`,
  );
});

test("invalid, malformed, and internally inconsistent demo tokens stay unreadable", () => {
  const inconsistent = {
    ...booking,
    balanceMinorUnits: 4_000,
  };

  assert.equal(readDemoPrivateBookingAccessToken("real-looking-token"), null);
  assert.equal(readDemoPrivateBookingAccessToken("demo.not_base64!"), null);
  assert.throws(
    () => createDemoPrivateBookingAccessToken(inconsistent),
    /snapshot is invalid/,
  );
});

test("pending review communicates protected capacity without using confirmed treatment", () => {
  const presentation = getBookingStatusPresentation(
    "reserved_pending_review",
    true,
  );

  assert.equal(presentation.badgeLabel, "Pendiente de revisión");
  assert.match(presentation.title, /revisando tu comprobante/);
  assert.match(presentation.description, /horario está protegido/);
  assert.match(presentation.expectation ?? "", /hasta 2 horas/);
  assert.equal(presentation.depositStateLabel, "Pendiente de revisión");
  assert.equal(presentation.showConfirmationMark, false);
  assert.equal(
    presentation.steps.find((step) => step.state === "current")?.label,
    "Revisión del anticipo",
  );
});

test("confirmed status is the only state that enables the confirmation mark", () => {
  const presentation = getBookingStatusPresentation("confirmed", true);

  assert.equal(presentation.badgeLabel, "Confirmada");
  assert.match(presentation.title, /cita está confirmada/);
  assert.equal(presentation.depositStateLabel, "Aprobado");
  assert.equal(presentation.showConfirmationMark, true);
  assert.ok(presentation.steps.every((step) => step.state === "complete"));
});

test("demo status query accepts only the two explicit visual states", () => {
  assert.equal(resolveDemoBookingStatus("confirmada"), "confirmed");
  assert.equal(resolveDemoBookingStatus(["pendiente"]), "reserved_pending_review");
  assert.equal(
    resolveDemoBookingStatus("desconocido", "confirmed"),
    "confirmed",
  );
});
