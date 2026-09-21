import Link from "next/link";
import type { ReactNode } from "react";

import { GotchuWordmark } from "@/components/brand/gotchu-wordmark";
import { PanelNavigation } from "@/components/layout/panel-navigation";

export function PanelShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col lg:flex-row">
      <aside className="border-b border-border bg-card px-5 py-5 lg:w-64 lg:border-r lg:border-b-0 lg:px-6 lg:py-8">
        <Link
          href="/"
          aria-label="Ir al inicio de Gotchu"
          className="inline-flex min-h-11 items-center text-lg"
        >
          <GotchuWordmark alt="" />
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">Panel de la barbería</p>

        <PanelNavigation />
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
