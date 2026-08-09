import type { Metadata } from "next";
import Link from "next/link";

import { ShadcnReservationDemo } from "@/components/examples/shadcn-reservation-demo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Ejemplo de shadcn/ui",
  description: "Ejemplo sencillo de composición de primitives de shadcn/ui.",
};

export default function ShadcnExamplePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <div className="mb-10 flex items-center justify-between gap-4">
        <Button asChild variant="ghost" className="min-h-11 px-3">
          <Link href="/">← Volver al inicio</Link>
        </Button>
        <p className="font-mono text-xs text-muted-foreground">/ejemplo-shadcn</p>
      </div>

      <header className="mb-8 max-w-3xl space-y-4">
        <p className="text-sm font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Tutorial práctico
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          shadcn/ui en un ejemplo pequeño
        </h1>
        <p className="text-base leading-7 text-muted-foreground sm:text-lg">
          Revisa el código de esta pantalla y luego cambia un texto, una
          variante o un color para familiarizarte con el flujo.
        </p>
      </header>

      <ShadcnReservationDemo />
    </main>
  );
}
