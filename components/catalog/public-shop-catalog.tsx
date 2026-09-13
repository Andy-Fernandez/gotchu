import {
  ChevronDown,
  ChevronRight,
  Clock3,
  MapPin,
  Scissors,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { GotchuWordmark } from "@/components/brand/gotchu-wordmark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PublicShopProfile } from "@/modules/catalog/public-shop-profile";

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
  const bookingHref = `/barberias/${encodeURIComponent(shop.slug)}/reservar`;

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href={`/barberias/${encodeURIComponent(shop.slug)}`}
            aria-label="Inicio de Gotchu"
            className="inline-flex min-h-11 items-center"
          >
            <GotchuWordmark />
          </Link>
          <Button asChild className="hidden sm:inline-flex">
            <Link href={bookingHref}>Reservar</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pt-4 pb-28 sm:px-6 sm:pt-6 sm:pb-12 lg:px-8">
        <section aria-labelledby="shop-name">
          <div className="relative h-52 overflow-hidden rounded-xl bg-foreground sm:h-72 lg:h-80">
            {shop.coverImage ? (
              <Image
                src={shop.coverImage.src}
                alt={shop.coverImage.alt}
                width={shop.coverImage.width}
                height={shop.coverImage.height}
                priority
                sizes="(min-width: 1024px) 896px, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-primary-foreground">
                <Scissors className="size-8" aria-hidden="true" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
            <Badge className="absolute top-3 left-3 border border-white/20 bg-black/70 text-white backdrop-blur">
              Vista demo · sin reservas reales
            </Badge>
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-1 [background:var(--brand-sheen)]"
            />
          </div>

          <div className="mt-5 grid items-end gap-5 md:grid-cols-[minmax(0,1fr)_15rem]">
            <div className="min-w-0">
              <h1 id="shop-name" className="text-title-lg tracking-tight text-balance sm:text-4xl">
                {shop.name}
              </h1>
              <p className="mt-2 max-w-2xl text-body-sm leading-6 text-muted-foreground sm:text-body">
                {shop.description}
              </p>
              <p className="mt-3 flex items-start gap-2 text-body-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span>{shop.publicAddress}</span>
              </p>
            </div>
            <Button asChild size="lg" className="hidden w-full md:inline-flex">
              <Link href={bookingHref}>Reservar ahora</Link>
            </Button>
          </div>
        </section>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section aria-labelledby="services-heading" className="min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h2 id="services-heading" className="text-title-md tracking-tight">
                Servicios
              </h2>
              <span className="text-body-sm text-muted-foreground">
                {services.length} {services.length === 1 ? "opción" : "opciones"}
              </span>
            </div>

            {services.length > 0 ? (
              <ul className="mt-4 grid min-w-0 gap-3">
                {services.map((service) => {
                  const eligibleBarbers = getEligibleBarberNames(service, barbers);
                  const isAvailable = eligibleBarbers.length > 0;

                  return (
                    <li key={service.id} className="min-w-0">
                      {isAvailable ? (
                        <Link
                          href={`${bookingHref}?service=${encodeURIComponent(service.id)}`}
                          aria-label={`Reservar ${service.name}, ${formatBobMinorUnits(service.priceMinorUnits)}, ${service.durationMinutes} minutos`}
                          className="block min-w-0 rounded-lg"
                        >
                          <ServiceRow
                            name={service.name}
                            description={service.description}
                            durationMinutes={service.durationMinutes}
                            priceLabel={formatBobMinorUnits(service.priceMinorUnits)}
                            depositLabel={service.depositMinorUnits > 0
                              ? formatBobMinorUnits(service.depositMinorUnits)
                              : null}
                          />
                        </Link>
                      ) : (
                        <ServiceRow
                          name={service.name}
                          description={service.description}
                          durationMinutes={service.durationMinutes}
                          priceLabel={formatBobMinorUnits(service.priceMinorUnits)}
                          depositLabel={null}
                          disabled
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Card className="mt-4">
                <CardContent>
                  <p className="text-body-sm text-muted-foreground">
                    Aún no hay servicios publicados.
                  </p>
                </CardContent>
              </Card>
            )}
          </section>

          <aside className="grid gap-3" aria-label="Información de la barbería">
            <details className="group rounded-lg border border-border bg-card">
              <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 font-semibold marker:content-none">
                <Clock3 className="size-4 text-muted-foreground" aria-hidden="true" />
                <span className="flex-1">Horarios</span>
                <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <dl className="space-y-2 border-t border-border px-4 py-4 text-body-sm">
                {openingHours.map((day) => (
                  <div key={day.dayOfWeek} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{day.label}</dt>
                    <dd className={day.isClosed ? "text-muted-foreground" : "font-medium"}>
                      {day.hours}
                    </dd>
                  </div>
                ))}
              </dl>
            </details>

            <details className="group rounded-lg border border-border bg-card">
              <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 font-semibold marker:content-none">
                <ShieldCheck className="size-4 text-muted-foreground" aria-hidden="true" />
                <span className="flex-1">Políticas</span>
                <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="space-y-4 border-t border-border px-4 py-4 text-body-sm leading-6">
                <div>
                  <h3 className="font-semibold">Cambios y cancelaciones</h3>
                  <p className="mt-1 text-muted-foreground">{shop.publicPolicy.cancellation}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Inasistencias</h3>
                  <p className="mt-1 text-muted-foreground">{shop.publicPolicy.noShow}</p>
                </div>
              </div>
            </details>
          </aside>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-sticky backdrop-blur md:hidden">
        <Button asChild size="lg" className="w-full">
          <Link href={bookingHref}>Reservar ahora</Link>
        </Button>
      </div>
    </div>
  );
}

function ServiceRow({
  name,
  description,
  durationMinutes,
  priceLabel,
  depositLabel,
  disabled = false,
}: {
  name: string;
  description: string;
  durationMinutes: number;
  priceLabel: string;
  depositLabel: string | null;
  disabled?: boolean;
}) {
  return (
    <Card
      size="sm"
      className={`min-w-0 ${disabled
        ? "opacity-60"
        : "transition-colors hover:border-input hover:bg-muted active:bg-accent"}`}
    >
      <CardContent className="flex min-h-24 items-center gap-3 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <Scissors className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{name}</span>
          <span className="mt-1 block truncate text-body-sm text-muted-foreground">
            {description}
          </span>
          <span className="mt-1 block text-caption text-muted-foreground">
            {durationMinutes} min{depositLabel ? ` · Anticipo ${depositLabel}` : ""}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block font-semibold">{priceLabel}</span>
          <span className={`mt-2 inline-flex items-center gap-1 text-caption font-semibold ${
            disabled ? "text-muted-foreground" : "text-accent-foreground"
          }`}>
            {disabled ? "No disponible" : "Elegir"}
            {!disabled ? <ChevronRight className="size-3" aria-hidden="true" /> : null}
          </span>
        </span>
      </CardContent>
    </Card>
  );
}
