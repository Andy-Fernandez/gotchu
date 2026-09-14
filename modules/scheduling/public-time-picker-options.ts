import type { AvailableSlot } from "./availability.ts";
import { getPublicSlotToken } from "./public-booking-page-state.ts";

export type PublicTimePeriodId = "morning" | "afternoon" | "evening";

export type PublicTimeOption = {
  token: string;
  label: string;
  periodId: PublicTimePeriodId;
  periodLabel: string;
  professionalCount: number;
};

export type PublicTimePeriodGroup = {
  id: PublicTimePeriodId;
  label: string;
  options: readonly PublicTimeOption[];
};

const PERIODS: ReadonlyArray<{
  id: PublicTimePeriodId;
  label: string;
  minHour: number;
  maxHour: number;
}> = [
  { id: "morning", label: "Mañana", minHour: 0, maxHour: 11 },
  { id: "afternoon", label: "Tarde", minHour: 12, maxHour: 17 },
  { id: "evening", label: "Noche", minHour: 18, maxHour: 23 },
];

export function createPublicTimePickerOptions(slots: readonly AvailableSlot[]): {
  periodGroups: readonly PublicTimePeriodGroup[];
  quickOptions: readonly PublicTimeOption[];
} {
  const slotsByStart = new Map<number, AvailableSlot[]>();

  for (const slot of slots) {
    const timestamp = slot.startsAt.getTime();
    const matchingSlots = slotsByStart.get(timestamp);

    if (matchingSlots) {
      matchingSlots.push(slot);
    } else {
      slotsByStart.set(timestamp, [slot]);
    }
  }

  const groupedSlots = [...slotsByStart.values()].sort(
    (left, right) => left[0].startsAt.getTime() - right[0].startsAt.getTime(),
  );
  const options = groupedSlots.map((matchingSlots) => {
    const representative = matchingSlots[0];
    const period = getTimePeriod(representative.startsAt);

    return {
      token: getPublicSlotToken(representative),
      label: formatPublicTime(representative.startsAt),
      periodId: period.id,
      periodLabel: period.label,
      professionalCount: new Set(matchingSlots.map((slot) => slot.barberId)).size,
    } satisfies PublicTimeOption;
  });

  const periodGroups = PERIODS.map((period) => ({
    id: period.id,
    label: period.label,
    options: options.filter((option) => option.periodId === period.id),
  }));

  const quickTokens = new Set<string>();

  for (const group of periodGroups) {
    const firstOption = group.options[0];
    if (firstOption) quickTokens.add(firstOption.token);
  }

  for (const option of options) {
    if (quickTokens.size >= 3) break;
    quickTokens.add(option.token);
  }

  return {
    periodGroups,
    quickOptions: options.filter((option) => quickTokens.has(option.token)).slice(0, 3),
  };
}

export function formatPublicTime(date: Date): string {
  return new Intl.DateTimeFormat("es-BO", {
    timeZone: "America/La_Paz",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getTimePeriod(date: Date) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/La_Paz",
    hour: "2-digit",
    hourCycle: "h23",
  }).format(date));
  const period = PERIODS.find((candidate) => hour >= candidate.minHour && hour <= candidate.maxHour);

  if (!period) {
    throw new RangeError("A valid shop-local hour is required.");
  }

  return period;
}
