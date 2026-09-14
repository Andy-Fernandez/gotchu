import type { Metadata } from "next";
import Link from "next/link";

import { GotchuAppIcon } from "@/components/brand/gotchu-app-icon";
import { GotchuConfirmationMark } from "@/components/brand/gotchu-confirmation-mark";
import { GotchuPill } from "@/components/brand/gotchu-pill";
import { GotchuSplash } from "@/components/brand/gotchu-splash";
import { GotchuWordmark } from "@/components/brand/gotchu-wordmark";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Sistema de marca",
  description: "Laboratorio visual de los assets de Gotchu.",
};

export default function BrandLabPage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center text-body-sm font-semibold text-accent-foreground hover:text-accent-hover"
      >
        ← Volver al inicio
      </Link>

      <header className="mt-4 max-w-2xl">
        <GotchuWordmark className="text-2xl" />
        <p className="mt-6 text-caption font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Laboratorio de marca
        </p>
        <h1 className="mt-2 text-title-lg tracking-tight">
          Assets listos para producto
        </h1>
        <p className="mt-3 text-body text-muted-foreground">
          Esta ruta permite revisar proporción, contraste y uso antes de llevar
          cada variante a una superficie funcional.
        </p>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-2" aria-label="Logos holográficos">
        <article className="flex min-h-64 items-center justify-center overflow-hidden rounded-3xl bg-foreground p-6 sm:p-10">
          <GotchuPill variant="fill" alt="Logo holográfico claro de Gotchu" />
        </article>
        <article className="flex min-h-64 items-center justify-center rounded-3xl border border-border bg-card p-6 sm:p-10">
          <GotchuPill variant="outline" alt="Logo holográfico oscuro de Gotchu" />
        </article>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2" aria-label="Aplicaciones compactas">
        <article className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <p className="text-caption font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Icono de aplicación
          </p>
          <div className="mt-6 flex items-end gap-4">
            <GotchuAppIcon className="size-24" />
            <GotchuAppIcon alt="" className="size-12" />
            <GotchuAppIcon alt="" className="size-8" />
          </div>
          <p className="mt-5 text-body-sm text-muted-foreground">
            Favicon, PWA, pantalla de inicio y espacios compactos.
          </p>
        </article>

        <article className="rounded-3xl border border-border bg-card p-6 text-center sm:p-8">
          <GotchuConfirmationMark className="mx-auto size-16" />
          <Badge className="mt-5 bg-success-subtle text-success">Confirmada</Badge>
          <h2 className="mt-3 text-title-md tracking-tight">¡Reserva confirmada!</h2>
          <p className="mt-2 text-body-sm text-muted-foreground">
            Este sello se renderiza únicamente después de recibir el estado
            autoritativo <code>confirmed</code>.
          </p>
        </article>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2" aria-label="Wordmarks monocromáticos">
        <article className="flex min-h-36 items-center justify-center rounded-3xl border border-border bg-card p-8">
          <GotchuWordmark className="text-3xl" />
        </article>
        <article className="flex min-h-36 items-center justify-center rounded-3xl bg-foreground p-8">
          <GotchuWordmark alt="Gotchu" className="text-3xl brightness-0 invert" />
        </article>
      </section>

      <section className="mt-4" aria-labelledby="splash-heading">
        <h2 id="splash-heading" className="sr-only">Pantalla de carga</h2>
        <GotchuSplash className="min-h-80 rounded-3xl" />
      </section>
    </main>
  );
}
