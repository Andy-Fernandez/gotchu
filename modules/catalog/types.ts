/** A recurring opening interval in the shop's local timezone, not a bookable slot. */
export type OpeningHours = {
  /** ISO weekday: 1 = Monday, 7 = Sunday. Omitted days are closed. */
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  /** Local 24-hour time in HH:mm format. */
  opensAt: string;
  closesAt: string;
};

export type PublicPolicy = {
  cancellation: string;
  noShow: string;
};

export type Shop = {
  id: string;
  slug: string;
  name: string;
  description: string;
  publicAddress: string;
  /** IANA timezone, initially America/La_Paz. */
  timezone: string;
  currency: "BOB";
  openingHours: readonly OpeningHours[];
  publicPolicy: PublicPolicy;
  isActive: boolean;
};

export type Service = {
  id: string;
  shopId: Shop["id"];
  name: string;
  description: string;
  /** Non-negative integer minor units in the shop's currency: Bs 45 = 4500. */
  priceMinorUnits: number;
  durationMinutes: number;
  bufferMinutes: number;
  /** Fixed deposit in integer minor units, between zero and the service price. */
  depositMinorUnits: number;
  eligibleBarberIds: readonly Barber["id"][];
  isActive: boolean;
};

export type Barber = {
  id: string;
  shopId: Shop["id"];
  displayName: string;
  isActive: boolean;
};

/** In-memory catalog records; this is not a persistence schema. */
export type Catalog = {
  shops: readonly Shop[];
  services: readonly Service[];
  barbers: readonly Barber[];
};
