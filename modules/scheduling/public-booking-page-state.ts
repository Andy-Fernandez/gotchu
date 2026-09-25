import { demoCatalog } from "../catalog/demo-catalog.ts";
import { createPublicShopProfileReader } from "../catalog/get-public-shop-profile.ts";
import type {
  PublicBarber,
  PublicShopProfile,
} from "../catalog/public-shop-profile.ts";
import type { Catalog, Shop } from "../catalog/types.ts";
import {
  calculatePublicAvailability,
  type AvailableSlot,
  type BarberWorkingHours,
  type LocalDate,
  type PublicAvailability,
} from "./availability.ts";

const BOOKING_WINDOW_DAYS = 30;
const DATE_OPTIONS_COUNT = 7;
const MINIMUM_ONLINE_LEAD_TIME_MINUTES = 120;
const BOOKING_POLICY = {
  slotIntervalMinutes: 15,
  combinedServiceBufferMinutes: 10,
} as const;

type QueryValue = string | readonly string[] | undefined;

export type PublicBookingSelection =
  | { kind: "missing" }
  | { kind: "invalid"; message: string }
  | {
      kind: "selected";
      serviceIds: readonly string[];
      /** Null means the customer has not chosen between any or a named barber yet. */
      barberPreference: PublicBarber["id"] | "any" | null;
      barberError: string | null;
      availability: PublicAvailability;
      /** A validated, advisory choice for the public-flow demonstration only. */
      selectedSlot: AvailableSlot | null;
      slotError: string | null;
    };

export type PublicBookingPageState = {
  profile: PublicShopProfile;
  selectedDate: LocalDate;
  dateOptions: readonly LocalDate[];
  bookingWindow: { startsOn: LocalDate; endsOn: LocalDate };
  dateError: string | null;
  requestedStep: "service" | "barber" | null;
  selection: PublicBookingSelection;
};

export type PublicBookingPageStateInput = {
  shopSlug: string;
  service?: QueryValue;
  barber?: QueryValue;
  date?: QueryValue;
  slot?: QueryValue;
  step?: QueryValue;
  /** Injectable server time keeps the query boundary deterministic in tests. */
  now?: Date;
};

/**
 * Builds a public, advisory booking view from server-owned demo configuration.
 * It deliberately never creates a hold or booking; each displayed slot comes
 * from the Day 3 availability operation and remains advisory until a future
 * atomic write revalidates it.
 */
export function createPublicBookingPageStateReader(catalog: Catalog) {
  const readProfile = createPublicShopProfileReader(catalog);

  return async function getPublicBookingPageState(
    input: PublicBookingPageStateInput,
  ): Promise<PublicBookingPageState | null> {
    const profile = await readProfile(input.shopSlug);
    if (!profile) return null;

    const now = input.now ?? new Date();
    const today = getLaPazDate(now);
    const dateResult = resolveRequestedDate(input.date, today);

    // An invalid date never becomes a date we claim to have used. We fall back
    // to today only so a valid service can keep the customer on a useful path.
    const selectedDate = dateResult.kind === "valid" ? dateResult.date : today;
    const dateOptions = getDateOptions(today, selectedDate);
    const bookingWindow = {
      startsOn: today,
      endsOn: addDays(today, BOOKING_WINDOW_DAYS),
    };
    const dateError = dateResult.kind === "invalid" ? dateResult.message : null;
    const requestedStep = resolveRequestedStep(input.step);
    const serviceIds = getQueryValues(input.service);
    if (serviceIds === undefined) {
      return {
        profile,
        selectedDate,
        dateOptions,
        bookingWindow,
        dateError,
        requestedStep,
        selection:
          input.service === undefined
            ? { kind: "missing" }
            : {
                kind: "invalid",
                message: "La selección de servicios no es válida.",
              },
      };
    }

    const selectedServices = serviceIds.map((serviceId) =>
      profile.services.find((service) => service.id === serviceId),
    );
    if (selectedServices.some((service) => !service)) {
      return {
        profile,
        selectedDate,
        dateOptions,
        bookingWindow,
        dateError,
        requestedStep,
        selection: {
          kind: "invalid",
          message: "Uno o más servicios elegidos ya no están disponibles.",
        },
      };
    }

    const availableServices = selectedServices.filter(
      (service): service is NonNullable<typeof service> => Boolean(service),
    );
    const commonEligibleBarberIds =
      getCommonEligibleBarberIds(availableServices);

    const barberResult = resolveRequestedBarber(
      input.barber,
      commonEligibleBarberIds,
      profile.barbers,
    );
    const availability = calculatePublicAvailability({
      catalog,
      shopId: profile.shop.id,
      serviceIds,
      date: selectedDate,
      // Availability can be prepared for the next step, but remains hidden
      // until the customer explicitly chooses any or a named barber.
      barberPreference: barberResult.preference ?? "any",
      barberWorkingHours: getDemoBarberWorkingHours(catalog, profile.shop.id),
      protectedIntervals: [],
      blockedPeriods: [],
      policy: BOOKING_POLICY,
    });
    const advisoryAvailability = {
      ...availability,
      slots: availability.slots.filter(
        (slot) =>
          slot.startsAt.getTime() >=
          now.getTime() + MINIMUM_ONLINE_LEAD_TIME_MINUTES * 60_000,
      ),
    };
    const slotResult =
      barberResult.preference === null
        ? {
            slot: null,
            error:
              input.slot === undefined
                ? null
                : "Elige un profesional antes de seleccionar un horario.",
          }
        : resolveRequestedSlot(input.slot, advisoryAvailability.slots);

    return {
      profile,
      selectedDate,
      dateOptions,
      bookingWindow,
      dateError,
      requestedStep,
      selection: {
        kind: "selected",
        serviceIds,
        barberPreference: barberResult.preference,
        barberError: barberResult.error,
        availability: advisoryAvailability,
        selectedSlot: slotResult.slot,
        slotError: slotResult.error,
      },
    };
  };
}

/** Public page operation. Pages do not import the demo catalog directly. */
export const getPublicBookingPageState =
  createPublicBookingPageStateReader(demoCatalog);

export function getPublicBookingHref(
  shopSlug: string,
  options: {
    serviceId?: string;
    serviceIds?: readonly string[];
    barberId?: PublicBarber["id"] | "any";
    date?: LocalDate;
    slot?: Pick<AvailableSlot, "barberId" | "startsAt">;
    step?: "service" | "barber";
  } = {},
): string {
  const searchParams = new URLSearchParams();
  const serviceIds =
    options.serviceIds ?? (options.serviceId ? [options.serviceId] : []);
  for (const serviceId of serviceIds) searchParams.append("service", serviceId);
  if (options.barberId) searchParams.set("barber", options.barberId);
  if (options.date) searchParams.set("date", options.date);
  if (options.slot) searchParams.set("slot", getPublicSlotToken(options.slot));
  if (options.step) searchParams.set("step", options.step);
  const query = searchParams.toString();
  return `/barberias/${encodeURIComponent(shopSlug)}/reservar${query ? `?${query}` : ""}`;
}

/**
 * Keeps an advisory slot selection in the URL. The token is always checked
 * against freshly calculated availability before the page exposes it again.
 */
export function getPublicSlotToken(
  slot: Pick<AvailableSlot, "barberId" | "startsAt">,
): string {
  return `${slot.barberId}|${slot.startsAt.toISOString()}`;
}

function getDemoBarberWorkingHours(
  catalog: Catalog,
  shopId: Shop["id"],
): BarberWorkingHours[] {
  const shop = catalog.shops.find(
    (candidate) => candidate.id === shopId && candidate.isActive,
  );
  if (!shop) return [];

  // The demo's server configuration declares that each published demo barber
  // works throughout the published shop hours. A browser never supplies this.
  return catalog.barbers
    .filter((barber) => barber.shopId === shop.id && barber.isActive)
    .flatMap((barber) =>
      shop.openingHours.map((hours) => ({
        barberId: barber.id,
        dayOfWeek: hours.dayOfWeek,
        startsAt: hours.opensAt as BarberWorkingHours["startsAt"],
        endsAt: hours.closesAt as BarberWorkingHours["endsAt"],
      })),
    );
}

function getSingleQueryValue(value: QueryValue): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function getQueryValues(value: QueryValue): string[] | undefined {
  if (typeof value === "string") return value.length > 0 ? [value] : undefined;
  if (!Array.isArray(value) || value.length === 0) return undefined;
  if (value.some((item) => typeof item !== "string" || item.length === 0))
    return undefined;
  return [...new Set(value)];
}

function getCommonEligibleBarberIds(
  services: readonly { eligibleBarberIds: readonly PublicBarber["id"][] }[],
): PublicBarber["id"][] {
  if (services.length === 0) return [];
  return services[0].eligibleBarberIds.filter((barberId) =>
    services.every((service) => service.eligibleBarberIds.includes(barberId)),
  );
}

function resolveRequestedBarber(
  value: QueryValue,
  eligibleBarberIds: readonly PublicBarber["id"][],
  barbers: readonly PublicBarber[],
): { preference: PublicBarber["id"] | "any" | null; error: string | null } {
  if (value === undefined) return { preference: null, error: null };

  const barberId = getSingleQueryValue(value);
  if (!barberId) {
    return {
      preference: null,
      error:
        "El profesional indicado no es válido. Elige una de las opciones disponibles.",
    };
  }

  if (barberId === "any") return { preference: "any", error: null };

  const isEligible =
    eligibleBarberIds.includes(barberId) &&
    barbers.some((barber) => barber.id === barberId);
  return isEligible
    ? { preference: barberId, error: null }
    : {
        preference: null,
        error:
          "Este profesional no está disponible para el servicio elegido. Elige otra opción.",
      };
}

function resolveRequestedSlot(
  value: QueryValue,
  slots: readonly AvailableSlot[],
): { slot: AvailableSlot | null; error: string | null } {
  if (value === undefined) return { slot: null, error: null };
  const token = getSingleQueryValue(value);
  if (!token) {
    return { slot: null, error: "El horario indicado no es válido." };
  }

  const slot = slots.find(
    (candidate) => getPublicSlotToken(candidate) === token,
  );
  return slot
    ? { slot, error: null }
    : {
        slot: null,
        error:
          "Ese horario ya no está disponible para esta consulta. Elige uno de los horarios mostrados.",
      };
}

function resolveRequestedDate(
  value: QueryValue,
  today: LocalDate,
): { kind: "valid"; date: LocalDate } | { kind: "invalid"; message: string } {
  if (value === undefined) return { kind: "valid", date: today };
  const date = getSingleQueryValue(value);
  if (!date || !isLocalDate(date)) {
    return { kind: "invalid", message: "La fecha indicada no es válida." };
  }

  const latestDate = addDays(today, BOOKING_WINDOW_DAYS);
  if (date < today || date > latestDate) {
    return {
      kind: "invalid",
      message: "La fecha debe estar dentro de los próximos 30 días.",
    };
  }

  return { kind: "valid", date };
}

function getLaPazDate(now: Date): LocalDate {
  if (Number.isNaN(now.getTime()))
    throw new RangeError("A valid server time is required.");
  const local = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  return `${local.getUTCFullYear()}-${String(local.getUTCMonth() + 1).padStart(2, "0")}-${String(local.getUTCDate()).padStart(2, "0")}` as LocalDate;
}

function getDateOptions(
  today: LocalDate,
  selectedDate: LocalDate,
): LocalDate[] {
  const options = Array.from({ length: DATE_OPTIONS_COUNT }, (_, index) =>
    addDays(today, index),
  );
  return options.includes(selectedDate)
    ? options
    : [...options, selectedDate].sort();
}

function resolveRequestedStep(value: QueryValue): "service" | "barber" | null {
  const step = getSingleQueryValue(value);
  return step === "service" || step === "barber" ? step : null;
}

function addDays(date: LocalDate, days: number): LocalDate {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return `${result.getUTCFullYear()}-${String(result.getUTCMonth() + 1).padStart(2, "0")}-${String(result.getUTCDate()).padStart(2, "0")}` as LocalDate;
}

function isLocalDate(value: string): value is LocalDate {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}
