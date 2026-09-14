import Link from "next/link";

import { GotchuPill } from "@/components/brand/gotchu-pill";

const routes = [
  {
    href: "/barberias/demo",
    title: "Experiencia del cliente",
    description: "Perfil público y entrada al flujo de reserva de una barbería.",
  },
  {
    href: "/panel/agenda",
    title: "Operación del negocio",
    description: "Agenda compartida para barberos, manager y owner.",
  },
  {
    href: "/dev/brand",
    title: "Sistema de marca",
    description: "Variantes, icono y sello de confirmación listos para QA.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center gap-6 px-4 py-6 sm:gap-8 sm:px-8 sm:py-10">
      <header className="relative isolate overflow-hidden rounded-[2rem] bg-foreground px-5 py-8 text-primary-foreground shadow-lg sm:px-10 sm:py-12">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-20 size-72 rounded-full opacity-25 blur-3xl [background:var(--brand-sheen)]"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-28 -left-24 size-64 rounded-full opacity-15 blur-3xl [background:var(--brand-sheen)]"
        />

        <div className="relative max-w-3xl">
          <GotchuPill
            variant="fill"
            className="max-w-72 sm:max-w-sm"
            preload
          />
          <p className="mt-8 text-caption font-semibold tracking-[0.18em] text-accent-on-dark uppercase sm:mt-10">
            Tu corte, asegurado
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Una agenda confiable para todo el trabajo de la barbería.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
            Reserva online y operación diaria comparten una sola agenda, sin
            duplicar reglas ni compromisos.
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Superficies del MVP">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className="group rounded-3xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <h2 className="text-lg font-semibold">{route.title}</h2>
            <p className="mt-2 leading-6 text-muted-foreground">{route.description}</p>
            <span className="mt-6 inline-flex min-h-11 items-center font-medium">
              Abrir estructura <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </section>

      <footer className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div>
          <p className="font-semibold">Gotchu MVP</p>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Entrada directa de clientes y panel operativo de una barbería.
          </p>
        </div>
        <GotchuPill
          variant="outline"
          alt=""
          className="w-40 sm:w-44"
        />
      </footer>
    </main>
  );
}
