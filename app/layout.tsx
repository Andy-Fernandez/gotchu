import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Gotchu",
  title: {
    default: "Gotchu",
    template: "%s · Gotchu",
  },
  description: "Reservas y operación diaria para barberías bolivianas.",
  appleWebApp: {
    capable: true,
    title: "Gotchu",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#181817",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full font-sans antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
