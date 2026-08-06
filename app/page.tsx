import Link from "next/link";

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
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center gap-10 px-5 py-12 sm:px-8">
      <header className="max-w-2xl space-y-4">
        <p className="text-sm font-semibold tracking-[0.16em] text-muted uppercase">
          Gotchu · MVP
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Una agenda confiable para todo el trabajo de la barbería.
        </h1>
        <p className="text-base leading-7 text-muted sm:text-lg">
          Este índice temporal expone las dos superficies del esqueleto. Los
          datos y operaciones reales se conectarán mediante los módulos de
          dominio, sin duplicar reglas en las páginas.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2" aria-label="Superficies del MVP">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className="group rounded-3xl border border-line bg-surface p-6 transition hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <h2 className="text-lg font-semibold">{route.title}</h2>
            <p className="mt-2 leading-6 text-muted">{route.description}</p>
            <span className="mt-6 inline-flex min-h-11 items-center font-medium">
              Abrir estructura <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
