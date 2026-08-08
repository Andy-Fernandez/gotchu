import Link from "next/link";
import type { ReactNode } from "react";

const panelRoutes = [
  { href: "/panel/agenda", label: "Agenda" },
  { href: "/panel/reservas", label: "Reservas" },
  { href: "/panel/anticipos", label: "Anticipos" },
  { href: "/panel/configuracion", label: "Configuración" },
];

export function PanelShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col lg:flex-row">
      <aside className="border-b border-border bg-card px-5 py-5 lg:w-64 lg:border-r lg:border-b-0 lg:px-6 lg:py-8">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Gotchu
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">Panel de la barbería</p>

        <nav
          className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:flex-col"
          aria-label="Navegación del panel"
        >
          {panelRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="inline-flex min-h-11 shrink-0 items-center rounded-xl px-4 text-sm font-medium hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {route.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
