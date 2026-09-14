import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gotchu",
    short_name: "Gotchu",
    description: "Reservas y operación diaria para barberías bolivianas.",
    start_url: "/",
    display: "standalone",
    background_color: "#181817",
    theme_color: "#181817",
    icons: [
      {
        src: "/brand/gotchu-app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/gotchu-app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
