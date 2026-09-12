import type {
  PublicBarber,
  PublicService,
} from "../../modules/catalog/public-shop-profile.ts";
import type { OpeningHours } from "../../modules/catalog/types.ts";

const bobFormatter = new Intl.NumberFormat("es-BO", {
  style: "currency",
  currency: "BOB",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const weekDays = [
  { dayOfWeek: 1, label: "Lunes" },
  { dayOfWeek: 2, label: "Martes" },
  { dayOfWeek: 3, label: "Miércoles" },
  { dayOfWeek: 4, label: "Jueves" },
  { dayOfWeek: 5, label: "Viernes" },
  { dayOfWeek: 6, label: "Sábado" },
  { dayOfWeek: 7, label: "Domingo" },
] as const;

export type OpeningHoursRow = {
  dayOfWeek: OpeningHours["dayOfWeek"];
  label: string;
  hours: string;
  isClosed: boolean;
};

export function formatBobMinorUnits(minorUnits: number) {
  return bobFormatter.format(minorUnits / 100);
}

export function getOpeningHoursRows(
  openingHours: readonly OpeningHours[],
): OpeningHoursRow[] {
  const hoursByDay = new Map(
    openingHours.map((hours) => [hours.dayOfWeek, hours]),
  );

  return weekDays.map(({ dayOfWeek, label }) => {
    const hours = hoursByDay.get(dayOfWeek);

    return {
      dayOfWeek,
      label,
      hours: hours ? `${hours.opensAt}–${hours.closesAt}` : "Cerrado",
      isClosed: !hours,
    };
  });
}

export function getEligibleBarberNames(
  service: Pick<PublicService, "eligibleBarberIds">,
  barbers: readonly PublicBarber[],
) {
  const namesById = new Map(
    barbers.map((barber) => [barber.id, barber.displayName]),
  );

  return service.eligibleBarberIds.flatMap((barberId) => {
    const displayName = namesById.get(barberId);
    return displayName ? [displayName] : [];
  });
}
