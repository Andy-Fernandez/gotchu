import type { Barber, Catalog, OpeningHours, Service, Shop } from "../catalog/types.ts";

/** The initial shop-local scheduling zone. Instants are returned as `Date` values. */
export const INITIAL_SHOP_TIMEZONE = "America/La_Paz" as const;

export type LocalDate = `${number}-${number}-${number}`;

export type LocalTime = `${number}:${number}`;

/** A recurring work interval for one exact barber in the shop's local timezone. */
export type BarberWorkingHours = {
  barberId: Barber["id"];
  dayOfWeek: OpeningHours["dayOfWeek"];
  startsAt: LocalTime;
  endsAt: LocalTime;
};

/** A date-specific shop opening override. An empty interval list means closed. */
export type ShopDateOverride = {
  date: LocalDate;
  openingHours: readonly LocalTimeInterval[];
};

export type LocalTimeInterval = {
  startsAt: LocalTime;
  endsAt: LocalTime;
};

/**
 * Capacity already assigned to an exact barber. `endsAt` is the protected end,
 * so a booking's service buffer must already be included by the caller.
 */
export type ProtectedInterval = {
  barberId: Barber["id"];
  startsAt: Date;
  endsAt: Date;
};

/** A break or manual block that removes capacity from one barber or the whole shop. */
export type BlockedPeriod =
  | {
      scope: "shop";
      startsAt: Date;
      endsAt: Date;
    }
  | {
      scope: "barber";
      barberId: Barber["id"];
      startsAt: Date;
      endsAt: Date;
    };

export type AvailabilityPolicy = {
  /** Public starts are generated on this positive whole-minute cadence. */
  slotIntervalMinutes: number;
  /** The one final buffer applied when more than one service is selected. */
  combinedServiceBufferMinutes: number;
};

export type CalculatePublicAvailabilityInput = {
  catalog: Catalog;
  shopId: Shop["id"];
  serviceIds: readonly Service["id"][];
  date: LocalDate;
  /** Omit or use `"any"` to return slots for every eligible barber. */
  barberPreference?: Barber["id"] | "any";
  barberWorkingHours: readonly BarberWorkingHours[];
  shopDateOverrides?: readonly ShopDateOverride[];
  protectedIntervals: readonly ProtectedInterval[];
  blockedPeriods: readonly BlockedPeriod[];
  policy: AvailabilityPolicy;
};

export type ServiceSelection = {
  serviceIds: readonly Service["id"][];
  totalPriceMinorUnits: number;
  serviceDurationMinutes: number;
  finalBufferMinutes: number;
  protectedDurationMinutes: number;
  eligibleBarberIds: readonly Barber["id"][];
};

export type AvailableSlot = {
  barberId: Barber["id"];
  startsAt: Date;
  /** The end of customer-facing service, before its final buffer. */
  serviceEndsAt: Date;
  /** The end of the full capacity-protecting interval, including buffer. */
  protectedEndsAt: Date;
};

export type PublicAvailability = {
  timezone: typeof INITIAL_SHOP_TIMEZONE;
  date: LocalDate;
  selection: ServiceSelection;
  slots: readonly AvailableSlot[];
};

type InstantInterval = { startsAt: Date; endsAt: Date };

const MINUTES_PER_DAY = 24 * 60;
const LA_PAZ_OFFSET_MINUTES = 4 * 60;

/**
 * Calculates advisory public slots. Server-side hold creation must recalculate
 * this capacity atomically before it writes anything.
 */
export function calculatePublicAvailability(
  input: CalculatePublicAvailabilityInput,
): PublicAvailability {
  const shop = getActiveShop(input.catalog, input.shopId);
  if (shop.timezone !== INITIAL_SHOP_TIMEZONE) {
    throw new RangeError(
      `Availability currently supports ${INITIAL_SHOP_TIMEZONE}; received ${shop.timezone}.`,
    );
  }

  validatePolicy(input.policy);
  const selection = selectServices(input.catalog, shop, input.serviceIds, input.policy);
  const eligibleBarberIds = resolveEligibleBarberIds(
    selection.eligibleBarberIds,
    input.barberPreference,
  );
  const dayOfWeek = getIsoDayOfWeek(input.date);
  const shopHours = getShopHoursForDate(shop, input.date, input.shopDateOverrides ?? []);
  const shopIntervals = toInstantIntervals(input.date, shopHours);
  const slots: AvailableSlot[] = [];

  for (const barberId of eligibleBarberIds) {
    const barberHours = input.barberWorkingHours
      .filter((hours) => hours.barberId === barberId && hours.dayOfWeek === dayOfWeek)
      .map((hours) => ({ startsAt: hours.startsAt, endsAt: hours.endsAt }));
    const workingIntervals = intersectIntervals(
      shopIntervals,
      toInstantIntervals(input.date, barberHours),
    );
    const excludedIntervals = getExcludedIntervals(
      barberId,
      input.protectedIntervals,
      input.blockedPeriods,
    );

    for (const workingInterval of workingIntervals) {
      for (const candidateStart of generateStarts(
        input.date,
        workingInterval,
        input.policy.slotIntervalMinutes,
      )) {
        const serviceEndsAt = addMinutes(candidateStart, selection.serviceDurationMinutes);
        const protectedEndsAt = addMinutes(candidateStart, selection.protectedDurationMinutes);
        if (protectedEndsAt > workingInterval.endsAt) continue;

        const candidate = { startsAt: candidateStart, endsAt: protectedEndsAt };
        if (excludedIntervals.some((excluded) => intervalsOverlap(excluded, candidate))) continue;

        slots.push({ barberId, startsAt: candidateStart, serviceEndsAt, protectedEndsAt });
      }
    }
  }

  slots.sort((left, right) => {
    const byStart = left.startsAt.getTime() - right.startsAt.getTime();
    return byStart || left.barberId.localeCompare(right.barberId);
  });

  return { timezone: INITIAL_SHOP_TIMEZONE, date: input.date, selection, slots };
}

/** The half-open interval rule shared by scheduling reads and future writes. */
export function intervalsOverlap(left: InstantInterval, right: InstantInterval): boolean {
  assertValidInstantInterval(left, "left interval");
  assertValidInstantInterval(right, "right interval");
  return left.startsAt < right.endsAt && right.startsAt < left.endsAt;
}

function getActiveShop(catalog: Catalog, shopId: string): Shop {
  const shop = catalog.shops.find((candidate) => candidate.id === shopId && candidate.isActive);
  if (!shop) throw new RangeError("An active shop is required to calculate availability.");
  return shop;
}

function selectServices(
  catalog: Catalog,
  shop: Shop,
  serviceIds: readonly string[],
  policy: AvailabilityPolicy,
): ServiceSelection {
  if (serviceIds.length === 0) throw new RangeError("At least one service is required.");
  const services = serviceIds.map((serviceId) => {
    const service = catalog.services.find(
      (candidate) => candidate.id === serviceId && candidate.shopId === shop.id && candidate.isActive,
    );
    if (!service) throw new RangeError("Every selected service must be active and belong to the shop.");
    assertServiceTiming(service);
    return service;
  });

  const eligibleBarberIds = services
    .map((service) => new Set(getActiveEligibleBarberIds(catalog, shop.id, service)))
    .reduce((intersection, current) =>
      new Set([...intersection].filter((barberId) => current.has(barberId))),
    );

  const serviceDurationMinutes = services.reduce(
    (total, service) => total + service.durationMinutes,
    0,
  );
  const finalBufferMinutes = services.length === 1
    ? services[0].bufferMinutes
    : policy.combinedServiceBufferMinutes;

  return {
    serviceIds: [...serviceIds],
    totalPriceMinorUnits: services.reduce((total, service) => total + service.priceMinorUnits, 0),
    serviceDurationMinutes,
    finalBufferMinutes,
    protectedDurationMinutes: serviceDurationMinutes + finalBufferMinutes,
    eligibleBarberIds: [...eligibleBarberIds],
  };
}

function getActiveEligibleBarberIds(catalog: Catalog, shopId: string, service: Service): string[] {
  const activeBarberIds = new Set(
    catalog.barbers
      .filter((barber) => barber.shopId === shopId && barber.isActive)
      .map((barber) => barber.id),
  );
  return service.eligibleBarberIds.filter((barberId) => activeBarberIds.has(barberId));
}

function resolveEligibleBarberIds(
  eligibleBarberIds: readonly string[],
  barberPreference: string | "any" | undefined,
): string[] {
  if (barberPreference && barberPreference !== "any") {
    return eligibleBarberIds.includes(barberPreference) ? [barberPreference] : [];
  }
  return [...eligibleBarberIds];
}

function getShopHoursForDate(
  shop: Shop,
  date: LocalDate,
  overrides: readonly ShopDateOverride[],
): LocalTimeInterval[] {
  const override = overrides.find((candidate) => candidate.date === date);
  if (override) return override.openingHours.map(copyLocalInterval);
  const dayOfWeek = getIsoDayOfWeek(date);
  return shop.openingHours
    .filter((hours) => hours.dayOfWeek === dayOfWeek)
    .map((hours) => ({ startsAt: hours.opensAt as LocalTime, endsAt: hours.closesAt as LocalTime }));
}

function getExcludedIntervals(
  barberId: string,
  protectedIntervals: readonly ProtectedInterval[],
  blockedPeriods: readonly BlockedPeriod[],
): InstantInterval[] {
  const protectedForBarber = protectedIntervals
    .filter((interval) => interval.barberId === barberId)
    .map((interval) => ({ startsAt: interval.startsAt, endsAt: interval.endsAt }));
  const blocksForBarber = blockedPeriods
    .filter((period) => period.scope === "shop" || period.barberId === barberId)
    .map((period) => ({ startsAt: period.startsAt, endsAt: period.endsAt }));
  for (const interval of [...protectedForBarber, ...blocksForBarber]) {
    assertValidInstantInterval(interval, "excluded interval");
  }
  return [...protectedForBarber, ...blocksForBarber];
}

function toInstantIntervals(date: LocalDate, intervals: readonly LocalTimeInterval[]): InstantInterval[] {
  return intervals.map((interval) => {
    const startsAt = localDateTimeToInstant(date, interval.startsAt);
    const endsAt = localDateTimeToInstant(date, interval.endsAt);
    const result = { startsAt, endsAt };
    assertValidInstantInterval(result, "local schedule interval");
    return result;
  });
}

function intersectIntervals(
  left: readonly InstantInterval[],
  right: readonly InstantInterval[],
): InstantInterval[] {
  const intersections: InstantInterval[] = [];
  for (const leftInterval of left) {
    for (const rightInterval of right) {
      const startsAt = leftInterval.startsAt > rightInterval.startsAt
        ? leftInterval.startsAt
        : rightInterval.startsAt;
      const endsAt = leftInterval.endsAt < rightInterval.endsAt
        ? leftInterval.endsAt
        : rightInterval.endsAt;
      if (startsAt < endsAt) intersections.push({ startsAt, endsAt });
    }
  }
  return intersections;
}

function* generateStarts(
  date: LocalDate,
  interval: InstantInterval,
  cadenceMinutes: number,
): Generator<Date> {
  const startOfDay = localDateTimeToInstant(date, "00:00");
  const firstAlignedMinute = Math.ceil(
    (interval.startsAt.getTime() - startOfDay.getTime()) / 60_000 / cadenceMinutes,
  ) * cadenceMinutes;
  for (let minute = firstAlignedMinute; minute < MINUTES_PER_DAY; minute += cadenceMinutes) {
    const candidate = addMinutes(startOfDay, minute);
    if (candidate >= interval.endsAt) return;
    yield candidate;
  }
}

function localDateTimeToInstant(date: LocalDate, time: LocalTime): Date {
  const [year, month, day] = parseDate(date);
  const [hours, minutes] = parseTime(time);
  // America/La_Paz is UTC−04:00 year-round. Keeping this conversion here makes
  // the IANA-zone assumption explicit instead of treating local strings as UTC.
  return new Date(Date.UTC(year, month - 1, day, hours, minutes + LA_PAZ_OFFSET_MINUTES));
}

function getIsoDayOfWeek(date: LocalDate): OpeningHours["dayOfWeek"] {
  const [year, month, day] = parseDate(date);
  const utcDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return (utcDay === 0 ? 7 : utcDay) as OpeningHours["dayOfWeek"];
}

function parseDate(date: LocalDate): [number, number, number] {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new RangeError("Dates must use YYYY-MM-DD in the shop timezone.");
  const [year, month, day] = match.slice(1).map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    throw new RangeError("Date is not a valid calendar date.");
  }
  return [year, month, day];
}

function parseTime(time: LocalTime): [number, number] {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) throw new RangeError("Times must use HH:mm in the shop timezone.");
  const [hours, minutes] = match.slice(1).map(Number);
  if (hours > 23 || minutes > 59) throw new RangeError("Time is not a valid 24-hour value.");
  return [hours, minutes];
}

function addMinutes(instant: Date, minutes: number): Date {
  return new Date(instant.getTime() + minutes * 60_000);
}

function copyLocalInterval(interval: LocalTimeInterval): LocalTimeInterval {
  return { startsAt: interval.startsAt, endsAt: interval.endsAt };
}

function validatePolicy(policy: AvailabilityPolicy): void {
  if (!Number.isSafeInteger(policy.slotIntervalMinutes) || policy.slotIntervalMinutes <= 0) {
    throw new RangeError("Slot cadence must be a positive whole number of minutes.");
  }
  if (!Number.isSafeInteger(policy.combinedServiceBufferMinutes) || policy.combinedServiceBufferMinutes < 0) {
    throw new RangeError("Combined-service buffer must be a non-negative whole number of minutes.");
  }
}

function assertServiceTiming(service: Service): void {
  if (!Number.isSafeInteger(service.durationMinutes) || service.durationMinutes <= 0) {
    throw new RangeError("Service duration must be a positive whole number of minutes.");
  }
  if (!Number.isSafeInteger(service.bufferMinutes) || service.bufferMinutes < 0) {
    throw new RangeError("Service buffer must be a non-negative whole number of minutes.");
  }
  if (!Number.isSafeInteger(service.priceMinorUnits) || service.priceMinorUnits < 0) {
    throw new RangeError("Service price must be non-negative integer minor units.");
  }
}

function assertValidInstantInterval(interval: InstantInterval, label: string): void {
  if (!(interval.startsAt instanceof Date) || Number.isNaN(interval.startsAt.getTime()) ||
      !(interval.endsAt instanceof Date) || Number.isNaN(interval.endsAt.getTime()) ||
      interval.startsAt >= interval.endsAt) {
    throw new RangeError(`${label} must have valid startsAt and endsAt values with startsAt before endsAt.`);
  }
}
