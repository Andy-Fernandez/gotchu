import type { Barber, Service, Shop, ShopImage } from "./types.ts";

/** Explicit allowlists prevent future private domain fields entering the public contract. */
export type PublicShopImage = Pick<
  ShopImage,
  "src" | "alt" | "width" | "height"
>;

export type PublicShop = Pick<
  Shop,
  | "id"
  | "slug"
  | "name"
  | "description"
  | "publicAddress"
  | "timezone"
  | "currency"
  | "openingHours"
  | "publicPolicy"
> & { images: readonly PublicShopImage[] };

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
