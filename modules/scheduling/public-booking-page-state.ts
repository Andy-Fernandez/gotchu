import { demoCatalog } from "../catalog/demo-catalog.ts";
import {
  createPublicShopProfileReader,
} from "../catalog/get-public-shop-profile.ts";
import type { PublicShopProfile } from "../catalog/public-shop-profile.ts";
import type { Catalog, Shop } from "../catalog/types.ts";
import {
  calculatePublicAvailability,
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
      serviceId: string;
      availability: PublicAvailability;
    };

export type PublicBookingPageState = {
  profile: PublicShopProfile;
  selectedDate: LocalDate;
  dateOptions: readonly LocalDate[];
  dateError: string | null;
  selection: PublicBookingSelection;
};

export type PublicBookingPageStateInput = {
  shopSlug: string;
  service?: QueryValue;
  date?: QueryValue;
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
    const dateOptions = getDateOptions(today);
    const dateResult = resolveRequestedDate(input.date, today);

    if (dateResult.kind === "invalid") {
      return {
        profile,
        selectedDate: today,
        dateOptions,
        dateError: dateResult.message,
        selection: { kind: "missing" },
      };
    }

    const selectedDate = dateResult.date;
    const serviceId = getSingleQueryValue(input.service);
    if (serviceId === undefined) {
      return {
        profile,
        selectedDate,
        dateOptions,
        dateError: null,
        selection: input.service === undefined
          ? { kind: "missing" }
          : { kind: "invalid", message: "El servicio indicado no es válido." },
      };
    }

    if (!profile.services.some((service) => service.id === serviceId)) {
      return {
        profile,
        selectedDate,
        dateOptions,
        dateError: null,
        selection: { kind: "invalid", message: "El servicio indicado no está disponible." },
      };
    }

    const availability = calculatePublicAvailability({
      catalog,
      shopId: profile.shop.id,
      serviceIds: [serviceId],
      date: selectedDate,
      barberWorkingHours: getDemoBarberWorkingHours(catalog, profile.shop.id),
      protectedIntervals: [],
      blockedPeriods: [],
      policy: BOOKING_POLICY,
    });
    const advisoryAvailability = selectedDate === today
      ? {
          ...availability,
          slots: availability.slots.filter((slot) =>
            slot.startsAt.getTime() >= now.getTime() + MINIMUM_ONLINE_LEAD_TIME_MINUTES * 60_000
          ),
        }
      : availability;

    return {
      profile,
      selectedDate,
      dateOptions,
      dateError: null,
      selection: { kind: "selected", serviceId, availability: advisoryAvailability },
    };
  };
}

/** Public page operation. Pages do not import the demo catalog directly. */
export const getPublicBookingPageState = createPublicBookingPageStateReader(demoCatalog);

export function getPublicBookingHref(
  shopSlug: string,
  options: { serviceId?: string; date?: LocalDate } = {},
): string {
  const searchParams = new URLSearchParams();
  if (options.serviceId) searchParams.set("service", options.serviceId);
  if (options.date) searchParams.set("date", options.date);
  const query = searchParams.toString();
  return `/barberias/${encodeURIComponent(shopSlug)}/reservar${query ? `?${query}` : ""}`;
}

function getDemoBarberWorkingHours(
  catalog: Catalog,
  shopId: Shop["id"],
): BarberWorkingHours[] {
  const shop = catalog.shops.find((candidate) => candidate.id === shopId && candidate.isActive);
  if (!shop) return [];

  // The demo's server configuration declares that each published demo barber
  // works throughout the published shop hours. A browser never supplies this.
  return catalog.barbers
    .filter((barber) => barber.shopId === shop.id && barber.isActive)
    .flatMap((barber) => shop.openingHours.map((hours) => ({
      barberId: barber.id,
      dayOfWeek: hours.dayOfWeek,
      startsAt: hours.opensAt as BarberWorkingHours["startsAt"],
      endsAt: hours.closesAt as BarberWorkingHours["endsAt"],
    })));
}

function getSingleQueryValue(value: QueryValue): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
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
  if (Number.isNaN(now.getTime())) throw new RangeError("A valid server time is required.");
  const local = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  return `${local.getUTCFullYear()}-${String(local.getUTCMonth() + 1).padStart(2, "0")}-${String(local.getUTCDate()).padStart(2, "0")}` as LocalDate;
}

function getDateOptions(today: LocalDate): LocalDate[] {
  return Array.from({ length: DATE_OPTIONS_COUNT }, (_, index) => addDays(today, index));
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
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}
