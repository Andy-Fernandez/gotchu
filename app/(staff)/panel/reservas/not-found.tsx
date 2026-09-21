import { SearchX } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

export default function ServiceHistoryNotFound() {
  return (
    <div className="mx-auto flex min-h-[70dvh] w-full max-w-2xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <Card className="w-full">
        <CardContent className="flex flex-col items-center px-5 py-10 text-center sm:px-8">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted">
            <SearchX className="size-5 text-muted-foreground" aria-hidden="true" />
          </span>
          <p className="mt-5 text-caption font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Registro no encontrado
          </p>
          <h1 className="mt-2 text-title-md tracking-tight">
            No encontramos este servicio
          </h1>
          <p className="mt-2 max-w-md text-body-sm leading-6 text-muted-foreground">
            Puede que el enlace haya cambiado o que el registro no pertenezca a
            esta barbería.
          </p>
          <Link
            href="/panel/reservas"
            className="mt-5 inline-flex min-h-11 items-center rounded-md bg-foreground px-4 text-button text-background hover:bg-foreground/90"
          >
            Volver al historial
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
