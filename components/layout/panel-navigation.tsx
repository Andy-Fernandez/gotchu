"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const panelRoutes = [
  { href: "/panel/agenda", label: "Agenda" },
  { href: "/panel/reservas", label: "Historial" },
  { href: "/panel/anticipos", label: "Anticipos" },
  { href: "/panel/configuracion", label: "Configuración" },
];

export function PanelNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="scrollbar-none mt-5 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:flex-col"
      aria-label="Navegación del panel"
    >
      {panelRoutes.map((route) => {
        const isCurrent =
          pathname === route.href || pathname.startsWith(`${route.href}/`);

        return (
          <Link
            key={route.href}
            href={route.href}
            aria-current={isCurrent ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center rounded-xl px-4 text-sm font-medium transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2",
              isCurrent &&
                "bg-foreground text-background hover:bg-foreground/90",
            )}
          >
            {route.label}
          </Link>
        );
      })}
    </nav>
  );
}
