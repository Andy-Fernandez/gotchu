const DEMO_ACCESS_TOKEN_PREFIX = "demo.";
const DEMO_ACCESS_TOKEN_MAX_LENGTH = 4_096;
const DEMO_SCHEMA_VERSION = 1 as const;

type QueryValue = string | readonly string[] | undefined;

export type DemoBookingStatus = "reserved_pending_review" | "confirmed";

export type DemoPrivateBooking = {
  schemaVersion: typeof DEMO_SCHEMA_VERSION;
  shopSlug: string;
  shopName: string;
  shopAddress: string;
  timeZone: string;
  serviceName: string;
  professionalName: string;
  startsAt: string;
  serviceEndsAt: string;
  durationMinutes: number;
  totalPriceMinorUnits: number;
  depositMinorUnits: number;
  balanceMinorUnits: number;
  bookingCode: string;
  policySummary: string;
};

export type CreateDemoPrivateBookingInput = Omit<
  DemoPrivateBooking,
  "schemaVersion"
>;

export type BookingStatusStep = {
  label: string;
  state: "complete" | "current" | "upcoming";
};

export type BookingStatusPresentation = {
  badgeLabel: string;
  title: string;
  description: string;
  expectation: string | null;
  depositStateLabel: string;
  showConfirmationMark: boolean;
  steps: readonly BookingStatusStep[];
};

/**
 * Builds a self-contained token for visual QA only. It contains no customer,
 * receipt, or real payment data and is not an authorization credential.
 * A real private status route must replace this with an unguessable token and
 * an authoritative booking reader.
 */
export function createDemoPrivateBookingAccessToken(
  input: CreateDemoPrivateBookingInput,
): string {
  const booking: DemoPrivateBooking = {
    schemaVersion: DEMO_SCHEMA_VERSION,
    ...input,
  };

  if (!isDemoPrivateBooking(booking)) {
    throw new TypeError("The demo private booking snapshot is invalid.");
  }

  const encoded = Buffer.from(JSON.stringify(booking), "utf8").toString(
    "base64url",
  );
  return `${DEMO_ACCESS_TOKEN_PREFIX}${encoded}`;
}

export function readDemoPrivateBookingAccessToken(
  accessToken: string,
): DemoPrivateBooking | null {
  if (
    !accessToken.startsWith(DEMO_ACCESS_TOKEN_PREFIX) ||
    accessToken.length > DEMO_ACCESS_TOKEN_MAX_LENGTH
  ) {
    return null;
  }

  const encoded = accessToken.slice(DEMO_ACCESS_TOKEN_PREFIX.length);
  if (!encoded || !/^[A-Za-z0-9_-]+$/.test(encoded)) return null;

  try {
    const decoded = Buffer.from(encoded, "base64url");
    if (decoded.toString("base64url") !== encoded) return null;

    const booking: unknown = JSON.parse(decoded.toString("utf8"));
    return isDemoPrivateBooking(booking) ? booking : null;
  } catch {
    return null;
  }
}

export function getDemoBookingSubmissionHref(accessToken: string): string {
  return `/reserva/${encodeURIComponent(accessToken)}/solicitud-enviada`;
}

export function getDemoBookingStatusHref(
  accessToken: string,
  status: DemoBookingStatus = "reserved_pending_review",
): string {
  const baseHref = `/reserva/${encodeURIComponent(accessToken)}`;
  return status === "confirmed" ? `${baseHref}?estado=confirmada` : baseHref;
}

export function resolveDemoBookingStatus(
  value: QueryValue,
  fallback: DemoBookingStatus = "reserved_pending_review",
): DemoBookingStatus {
  const candidate = typeof value === "string" ? value : value?.[0];

  if (candidate === "confirmada") return "confirmed";
  if (candidate === "pendiente") return "reserved_pending_review";
  return fallback;
}

export function getBookingStatusPresentation(
  status: DemoBookingStatus,
  requiresDeposit: boolean,
): BookingStatusPresentation {
  if (status === "confirmed") {
    return {
      badgeLabel: "Confirmada",
      title: "¡Tu cita está confirmada!",
      description:
        "Tu horario y tu profesional ya están asegurados. Te esperamos.",
      expectation: null,
      depositStateLabel: requiresDeposit ? "Aprobado" : "No requiere",
      showConfirmationMark: true,
      steps: [
        {
          label: requiresDeposit
            ? "Comprobante recibido"
            : "Solicitud recibida",
          state: "complete",
        },
        {
          label: requiresDeposit ? "Anticipo aprobado" : "Solicitud revisada",
          state: "complete",
        },
        { label: "Cita confirmada", state: "complete" },
      ],
    };
  }

  return {
    badgeLabel: "Pendiente de revisión",
    title: requiresDeposit
      ? "Estamos revisando tu comprobante"
      : "Estamos revisando tu solicitud",
    description: requiresDeposit
      ? "Tu horario está protegido. La cita se confirmará cuando la barbería apruebe el anticipo. No necesitas volver a enviarlo."
      : "Tu horario está protegido mientras la barbería revisa la solicitud. Por ahora no necesitas hacer nada.",
    expectation: requiresDeposit
      ? "Revisaremos tu comprobante en un plazo de hasta 2 horas durante nuestro horario de atención."
      : "Vuelve a esta pantalla para consultar el resultado.",
    depositStateLabel: requiresDeposit
      ? "Pendiente de revisión"
      : "No requiere",
    showConfirmationMark: false,
    steps: [
      {
        label: requiresDeposit ? "Comprobante recibido" : "Solicitud recibida",
        state: "complete",
      },
      {
        label: requiresDeposit
          ? "Revisión del anticipo"
          : "Revisión de la solicitud",
        state: "current",
      },
      { label: "Confirmación de la cita", state: "upcoming" },
    ],
  };
}

function isDemoPrivateBooking(value: unknown): value is DemoPrivateBooking {
  if (!value || typeof value !== "object") return false;
  const booking = value as Partial<DemoPrivateBooking>;
  const startsAt = new Date(booking.startsAt ?? "");
  const serviceEndsAt = new Date(booking.serviceEndsAt ?? "");

  return (
    booking.schemaVersion === DEMO_SCHEMA_VERSION &&
    isSafeText(booking.shopSlug, 80) &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(booking.shopSlug) &&
    isSafeText(booking.shopName, 120) &&
    isSafeText(booking.shopAddress, 180) &&
    booking.timeZone === "America/La_Paz" &&
    isSafeText(booking.serviceName, 180) &&
    isSafeText(booking.professionalName, 120) &&
    !Number.isNaN(startsAt.getTime()) &&
    !Number.isNaN(serviceEndsAt.getTime()) &&
    startsAt < serviceEndsAt &&
    isPositiveInteger(booking.durationMinutes) &&
    isMinorUnits(booking.totalPriceMinorUnits) &&
    isMinorUnits(booking.depositMinorUnits) &&
    isMinorUnits(booking.balanceMinorUnits) &&
    booking.depositMinorUnits <= booking.totalPriceMinorUnits &&
    booking.balanceMinorUnits ===
      booking.totalPriceMinorUnits - booking.depositMinorUnits &&
    isSafeText(booking.bookingCode, 80) &&
    isSafeText(booking.policySummary, 320)
  );
}

function isSafeText(value: unknown, maxLength: number): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maxLength
  );
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function isMinorUnits(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}
