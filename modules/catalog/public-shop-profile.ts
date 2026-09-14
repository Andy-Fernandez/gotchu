import type { Barber, Service, Shop } from "./types.ts";

/** Explicit allowlists prevent future private domain fields entering the public contract. */
export type PublicShop = Pick<
  Shop,
  | "id"
  | "slug"
  | "name"
  | "description"
  | "publicAddress"
  | "coverImage"
  | "timezone"
  | "currency"
  | "openingHours"
  | "publicPolicy"
>;

export type PublicService = Pick<
  Service,
  | "id"
  | "shopId"
  | "name"
  | "description"
  | "priceMinorUnits"
  | "durationMinutes"
  | "bufferMinutes"
  | "depositMinorUnits"
  | "eligibleBarberIds"
>;

export type PublicBarber = Pick<Barber, "id" | "shopId" | "displayName">;

export type PublicShopProfile = {
  shop: PublicShop;
  services: PublicService[];
  barbers: PublicBarber[];
};
