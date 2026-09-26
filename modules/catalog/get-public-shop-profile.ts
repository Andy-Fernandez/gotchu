import { demoCatalog } from "./demo-catalog.ts";
import type { PublicShopProfile } from "./public-shop-profile.ts";
import type { Catalog } from "./types.ts";

/** Binds an in-memory catalog so tests can use isolated fixtures. */
export function createPublicShopProfileReader(catalog: Catalog) {
  return async function getPublicShopProfile(
    shopSlug: string,
  ): Promise<PublicShopProfile | null> {
    const shop = catalog.shops.find(
      (candidate) => candidate.slug === shopSlug && candidate.isActive,
    );

    if (!shop) return null;

    const barbers = catalog.barbers
      .filter((barber) => barber.shopId === shop.id && barber.isActive)
      .map((barber) => ({
        id: barber.id,
        shopId: barber.shopId,
        displayName: barber.displayName,
      }));
    const publicBarberIds = new Set(barbers.map((barber) => barber.id));

    const services = catalog.services
      .filter((service) => service.shopId === shop.id && service.isActive)
      .map((service) => ({
        id: service.id,
        shopId: service.shopId,
        name: service.name,
        description: service.description,
        priceMinorUnits: service.priceMinorUnits,
        durationMinutes: service.durationMinutes,
        bufferMinutes: service.bufferMinutes,
        depositMinorUnits: service.depositMinorUnits,
        eligibleBarberIds: service.eligibleBarberIds.filter((id) =>
          publicBarberIds.has(id),
        ),
      }));

    // Copy only public fields, including nested objects; callers never receive source records.
    return {
      shop: {
        id: shop.id,
        slug: shop.slug,
        name: shop.name,
        description: shop.description,
        publicAddress: shop.publicAddress,
        images: shop.images.map((image) => ({
          src: image.src,
          alt: image.alt,
          width: image.width,
          height: image.height,
        })),
        timezone: shop.timezone,
        currency: shop.currency,
        openingHours: shop.openingHours.map((hours) => ({
          dayOfWeek: hours.dayOfWeek,
          opensAt: hours.opensAt,
          closesAt: hours.closesAt,
        })),
        publicPolicy: {
          cancellation: shop.publicPolicy.cancellation,
          noShow: shop.publicPolicy.noShow,
        },
      },
      services,
      barbers,
    };
  };
}

/** Public application operation. Pages call this, never import the demo catalog. */
export const getPublicShopProfile = createPublicShopProfileReader(demoCatalog);
