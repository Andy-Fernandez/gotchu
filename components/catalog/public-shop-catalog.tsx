import { Clock3, MapPin, Scissors, ShieldCheck, UserRound } from "lucide-react";

import type { PublicShopProfile } from "@/modules/catalog/public-shop-profile";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  formatBobMinorUnits,
  getEligibleBarberNames,
  getOpeningHoursRows,
} from "./public-catalog-formatters";

type PublicShopCatalogProps = {
  profile: PublicShopProfile;
};

export function PublicShopCatalog({ profile }: PublicShopCatalogProps) {
  const { shop, services, barbers } = profile;
  const openingHours = getOpeningHoursRows(shop.openingHours);

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-lg font-semibold tracking-tight">Gotchu</p>
          <Badge variant="outline" className="h-7 px-3">
            Catálogo público
          </Badge>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <section aria-labelledby="shop-name" className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)] md:items-start">
          <div>
            <p className="text-body-sm font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Perfil de la barbería
            </p>
            <h1 id="shop-name" className="mt-3 text-title-lg tracking-tight text-balance sm:text-4xl sm:leading-tight">
              {shop.name}
            </h1>
            <div className="mt-5 rounded-lg border border-accent-foreground/20 bg-accent px-4 py-4 text-body leading-7 text-foreground sm:px-5">
              <p>{shop.description}</p>
            </div>
          </div>

          <Card className="gap-0 py-0">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <div>
                  <h2 className="text-body-sm font-semibold">Ubicación</h2>
                  <address className="mt-1 text-body-sm leading-6 text-muted-foreground not-italic">
                    {shop.publicAddress}
                  </address>
                </div>
              </div>

              <Separator />

              <div className="flex gap-3">
                <Clock3 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-body-sm font-semibold">Horario de atención</h2>
                  <p className="mt-1 text-caption text-muted-foreground">
                    Hora local de la barbería
                  </p>
                  <dl className="mt-3 space-y-2 text-body-sm">
                    {openingHours.map((day) => (
                      <div key={day.dayOfWeek} className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">{day.label}</dt>
                        <dd className={day.isClosed ? "font-medium text-muted-foreground" : "font-medium"}>
                          {day.hours}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="services-heading" className="mt-12 sm:mt-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-body-sm font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Servicios
              </p>
              <h2 id="services-heading" className="mt-2 text-title-md tracking-tight sm:text-3xl">
                Elige lo que necesitas
              </h2>
            </div>
            <Badge variant="secondary" className="h-7 border border-border px-3">
              {services.length} {services.length === 1 ? "servicio" : "servicios"}
            </Badge>
          </div>

          {services.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {services.map((service) => {
                const eligibleBarberNames = getEligibleBarberNames(service, barbers);

                return (
                  <Card key={service.id} className="h-full gap-0 py-0">
                    <CardContent className="flex h-full flex-col p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-title-sm tracking-tight">{service.name}</h3>
                          <p className="mt-2 text-body-sm leading-6 text-muted-foreground">
                            {service.description}
                          </p>
                        </div>
                        <p className="shrink-0 text-title-sm" aria-label={`Precio: ${formatBobMinorUnits(service.priceMinorUnits)}`}>
                          {formatBobMinorUnits(service.priceMinorUnits)}
                        </p>
                      </div>

                      <Separator className="my-5" />

                      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-body-sm">
                        <div>
                          <dt className="text-muted-foreground">Duración</dt>
                          <dd className="mt-1 font-semibold">{service.durationMinutes} min</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Tiempo adicional</dt>
                          <dd className="mt-1 font-semibold">{service.bufferMinutes} min</dd>
                        </div>
                        <div className="col-span-2">
                          <dt className="text-muted-foreground">Anticipo</dt>
                          <dd className="mt-1 font-semibold">
                            {service.depositMinorUnits === 0
                              ? "Sin anticipo"
                              : formatBobMinorUnits(service.depositMinorUnits)}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-5 border-t border-border pt-5">
                        <div className="flex items-center gap-2">
                          <UserRound className="size-4" aria-hidden="true" />
                          <h4 className="text-body-sm font-semibold">Profesionales elegibles</h4>
                        </div>
                        {eligibleBarberNames.length > 0 ? (
                          <ul className="mt-3 flex flex-wrap gap-2" aria-label={`Profesionales elegibles para ${service.name}`}>
                            {eligibleBarberNames.map((displayName) => (
                              <li key={displayName}>
                                <Badge variant="outline" className="h-7 px-3 font-medium">
                                  {displayName}
                                </Badge>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-body-sm leading-6 text-muted-foreground">
                            Sin profesionales elegibles publicados.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="mt-6">
              <CardContent>
                <p className="text-body leading-7 text-muted-foreground">
                  Esta barbería todavía no tiene servicios públicos disponibles.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        <section aria-labelledby="policies-heading" className="mt-12 sm:mt-16">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-6" aria-hidden="true" />
            <h2 id="policies-heading" className="text-title-md tracking-tight">
              Políticas antes de reservar
            </h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent>
                <h3 className="font-semibold">Cancelaciones y cambios</h3>
                <p className="mt-2 text-body-sm leading-6 text-muted-foreground">
                  {shop.publicPolicy.cancellation}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <h3 className="font-semibold">Inasistencias</h3>
                <p className="mt-2 text-body-sm leading-6 text-muted-foreground">
                  {shop.publicPolicy.noShow}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <aside className="mt-12 rounded-lg bg-foreground px-5 py-5 text-primary-foreground sm:px-6" aria-label="Estado de las reservas en línea">
          <div className="flex gap-3">
            <Scissors className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">Catálogo informativo</p>
              <p className="mt-1 text-body-sm leading-6 text-neutral-200">
                La reserva en línea todavía no está disponible en esta etapa de Gotchu.
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
