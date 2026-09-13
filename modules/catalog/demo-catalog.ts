import type { Catalog } from "./types.ts";

const shopId = "shop-demo";
const alexId = "barber-demo-alex";
const samId = "barber-demo-sam";

/** Entirely fictional. Prices, timings, deposits, hours, and policies are demo assumptions. */
export const demoCatalog: Catalog = {
  shops: [
    {
      id: shopId,
      slug: "demo",
      name: "Barbería Demo Gotchu",
      description:
        "Cortes clásicos, fades y barba en un espacio cómodo. Perfil ficticio de demostración.",
      publicAddress: "Dirección ficticia de demostración, La Paz, Bolivia",
      coverImage: {
        src: "/demo/barbershop-cover.png",
        alt: "Barbero trabajando en una barbería contemporánea de demostración",
        width: 2048,
        height: 1280,
      },
      timezone: "America/La_Paz",
      currency: "BOB",
      openingHours: [
        { dayOfWeek: 1, opensAt: "09:00", closesAt: "19:00" },
        { dayOfWeek: 2, opensAt: "09:00", closesAt: "19:00" },
        { dayOfWeek: 3, opensAt: "09:00", closesAt: "19:00" },
        { dayOfWeek: 4, opensAt: "09:00", closesAt: "19:00" },
        { dayOfWeek: 5, opensAt: "09:00", closesAt: "19:00" },
        { dayOfWeek: 6, opensAt: "09:00", closesAt: "17:00" },
      ],
      publicPolicy: {
        cancellation:
          "Política de ejemplo: solicita la cancelación o el cambio antes de la hora reservada.",
        noShow:
          "Política de ejemplo: si no asistes, contacta a la barbería para coordinar otra visita.",
      },
      isActive: true,
    },
  ],
  barbers: [
    { id: alexId, shopId, displayName: "Alex (demo)", isActive: true },
    { id: samId, shopId, displayName: "Sam (demo)", isActive: true },
  ],
  services: [
    {
      id: "service-demo-corte",
      shopId,
      name: "Corte de pelo normal",
      description: "Corte de pelo de ejemplo.",
      priceMinorUnits: 4500,
      durationMinutes: 30,
      bufferMinutes: 5,
      depositMinorUnits: 1000,
      eligibleBarberIds: [alexId, samId],
      isActive: true,
    },
    {
      id: "service-demo-cejas",
      shopId,
      name: "Cejas",
      description: "Perfilado de cejas de ejemplo.",
      priceMinorUnits: 500,
      durationMinutes: 10,
      bufferMinutes: 5,
      depositMinorUnits: 0,
      eligibleBarberIds: [samId],
      isActive: true,
    },
    {
      id: "service-demo-barba",
      shopId,
      name: "Barba",
      description: "Recorte y perfilado de barba de ejemplo.",
      priceMinorUnits: 1500,
      durationMinutes: 20,
      bufferMinutes: 5,
      depositMinorUnits: 500,
      eligibleBarberIds: [alexId],
      isActive: true,
    },
  ],
};
