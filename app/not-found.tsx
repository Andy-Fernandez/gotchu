import Link from "next/link";

import { GotchuAppIcon } from "@/components/brand/gotchu-app-icon";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center gap-5 px-5 py-12 text-center">
      <GotchuAppIcon alt="" className="mx-auto size-14" />
      <p className="text-sm font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        404
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">
        No encontramos esta página
      </h1>
      <p className="leading-7 text-muted-foreground">
        El enlace puede haber cambiado o todavía no formar parte del MVP.
      </p>
      <Link
        href="/"
        className="mx-auto inline-flex min-h-11 items-center rounded-full bg-foreground px-5 font-medium text-background focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
