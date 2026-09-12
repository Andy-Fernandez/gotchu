import Link from "next/link";

import {
  getPublicBookingHref,
  type PublicBookingPageState,
} from "@/modules/scheduling/public-booking-page-state";
import { formatBobMinorUnits } from "@/components/catalog/public-catalog-formatters";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type PublicBookingPageProps = {
  state: PublicBookingPageState;
};

export function PublicBookingPage({ state }: PublicBookingPageProps) {
  const { profile, selection } = state;
  const selectedService = selection.kind === "selected"
    ? profile.services.find((service) => service.id === selection.serviceId)
    : undefined;
  const selectedSlot = selection.kind === "selected" ? selection.selectedSlot : null;

  return (
    <main className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href={`/barberias/${encodeURIComponent(profile.shop.slug)}`} className="text-lg font-semibold tracking-tight">
            Gotchu
          </Link>
          <Link
            href={`/barberias/${encodeURIComponent(profile.shop.slug)}`}
            className="text-body-sm font-semibold text-accent-foreground underline-offset-4 hover:text-accent-hover hover:underline"
          >
            Ver barbería
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-body-sm font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Reserva pública
        </p>
        <h1 className="mt-2 text-title-lg tracking-tight">Elige tu servicio y horario</h1>
        <p className="mt-3 text-body leading-7 text-muted-foreground">
          {profile.shop.name}. Los horarios se consultan para el servicio que elijas.
        </p>

        <section className="mt-8" aria-labelledby="service-heading">
          <div className="flex items-baseline gap-3">
            <Badge variant="secondary" className="h-7 border border-border px-3">1</Badge>
            <h2 id="service-heading" className="text-title-sm tracking-tight">Elige un servicio</h2>
          </div>
          <ul className="mt-4 grid gap-3">
            {profile.services.map((service) => {
              const isSelected = service.id === selectedService?.id;
              return (
                <li key={service.id}>
                  <Link
                    href={getPublicBookingHref(profile.shop.slug, {
                      serviceId: service.id,
                      date: state.selectedDate,
                    })}
                    aria-current={isSelected ? "true" : undefined}
                    className={`block min-h-11 rounded-lg border p-4 transition-colors ${
                      isSelected
                        ? "border-foreground bg-accent"
                        : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="break-words font-semibold">{service.name}</p>
                        <p className="mt-1 text-body-sm leading-5 text-muted-foreground">
                          {service.durationMinutes} min · {service.bufferMinutes} min de tiempo adicional
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold">{formatBobMinorUnits(service.priceMinorUnits)}</span>
                    </div>
                    {isSelected ? (
                      <p className="mt-3 text-body-sm font-semibold" aria-live="polite">
                        Servicio seleccionado. Ahora elige un día y un horario.
                      </p>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {state.dateError ? (
          <StatusMessage title="No pudimos usar esa fecha" message={state.dateError} />
        ) : null}
        {selection.kind === "invalid" ? (
          <StatusMessage title="No pudimos usar ese servicio" message={selection.message} />
        ) : null}

        {selection.kind === "missing" && !state.dateError ? (
          <StatusMessage
            title="Primero elige un servicio"
            message="La duración, el tiempo adicional y los profesionales disponibles dependen del servicio."
          />
        ) : null}

        {selectedService && selection.kind === "selected" ? (
          <>
            <section className="mt-8" aria-labelledby="date-heading">
              <div className="flex items-baseline gap-3">
                <Badge variant="secondary" className="h-7 border border-border px-3">2</Badge>
                <h2 id="date-heading" className="text-title-sm tracking-tight">Elige un día</h2>
              </div>
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Días disponibles para consultar">
                {state.dateOptions.map((date) => {
                  const isSelected = date === state.selectedDate;
                  return (
                    <li key={date}>
                      <Link
                        href={getPublicBookingHref(profile.shop.slug, { serviceId: selectedService.id, date })}
                        aria-current={isSelected ? "date" : undefined}
                        className={`flex min-h-11 items-center justify-center rounded-md border px-3 py-3 text-center text-body-sm font-semibold transition-colors ${
                          isSelected
                            ? "border-foreground bg-foreground text-primary-foreground"
                            : "border-border bg-card hover:bg-muted"
                        }`}
                      >
                        {formatDate(date)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="mt-8" aria-labelledby="slots-heading">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-3">
                  <Badge variant="secondary" className="h-7 border border-border px-3">3</Badge>
                  <h2 id="slots-heading" className="text-title-sm tracking-tight">Horarios disponibles</h2>
                </div>
                <p className="text-body-sm text-muted-foreground">{formatDate(state.selectedDate)} · Hora de La Paz</p>
              </div>

              <Card className="mt-4 gap-0 py-0">
                <CardContent className="p-5 sm:p-6">
                  <p className="font-semibold">{selectedService.name}</p>
                  <p className="mt-1 text-body-sm text-muted-foreground">
                    {formatBobMinorUnits(selection.availability.selection.totalPriceMinorUnits)} · {selection.availability.selection.serviceDurationMinutes} min · {selection.availability.selection.finalBufferMinutes} min de tiempo adicional
                  </p>
                </CardContent>
              </Card>

              {selection.slotError ? (
                <StatusMessage title="No pudimos usar ese horario" message={selection.slotError} />
              ) : null}

              {selection.availability.slots.length > 0 ? (
                <ul className="mt-4 grid gap-3" aria-label={`Horarios disponibles para ${selectedService.name}`}>
                  {selection.availability.slots.map((slot) => {
                    const barber = profile.barbers.find((candidate) => candidate.id === slot.barberId);
                    const isSelected = selectedSlot?.barberId === slot.barberId &&
                      selectedSlot.startsAt.getTime() === slot.startsAt.getTime();
                    const barberName = barber?.displayName ?? "Profesional elegible";
                    return (
                      <li key={`${slot.barberId}-${slot.startsAt.toISOString()}`}>
                        <Link
                          href={getPublicBookingHref(profile.shop.slug, {
                            serviceId: selectedService.id,
                            date: state.selectedDate,
                            slot,
                          })}
                          aria-current={isSelected ? "true" : undefined}
                          aria-label={`Elegir ${formatTime(slot.startsAt)} con ${barberName}; termina ${formatTime(slot.serviceEndsAt)}. Esto no reserva el horario.`}
                          className="block min-h-11 rounded-lg"
                        >
                          <Card size="sm" className={isSelected ? "border-foreground bg-accent" : "hover:bg-muted"}>
                            <CardContent className="flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <p className="font-semibold">{formatTime(slot.startsAt)}</p>
                                <p className="mt-1 break-words text-body-sm text-muted-foreground">
                                  {barberName} · termina {formatTime(slot.serviceEndsAt)}
                                </p>
                                {isSelected ? (
                                  <p className="mt-2 text-body-sm font-semibold">Horario seleccionado para la demostración</p>
                                ) : null}
                              </div>
                              <Badge variant="outline" className="h-7 shrink-0 px-3">
                                {isSelected ? "Seleccionado" : "Disponible"}
                              </Badge>
                            </CardContent>
                          </Card>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <StatusMessage
                  title={selection.availability.selection.eligibleBarberIds.length === 0
                    ? "No hay profesionales elegibles para este servicio"
                    : "No hay horarios para este día"}
                  message={selection.availability.selection.eligibleBarberIds.length === 0
                    ? "Este servicio no tiene un profesional publicado que pueda atenderlo. Prueba otro servicio."
                    : "Prueba otro día o vuelve a elegir un servicio. No se ha creado ninguna reserva."}
                />
              )}

              {selectedSlot ? (
                <StatusMessage
                  title="Horario seleccionado para la demostración"
                  message="Esta elección no crea un hold ni confirma una reserva. La disponibilidad se deberá validar nuevamente cuando exista el flujo de reserva."
                />
              ) : null}

              <p className="mt-5 text-body-sm leading-6 text-muted-foreground">
                Esta consulta muestra disponibilidad calculada. Elegir un horario aquí solo demuestra el flujo: no reserva ni bloquea capacidad.
              </p>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

function StatusMessage({ title, message }: { title: string; message: string }) {
  return (
    <div role="status" aria-live="polite" className="mt-6 rounded-lg border border-information/30 bg-information-subtle p-4">
      <p className="font-semibold text-information">{title}</p>
      <p className="mt-1 text-body-sm leading-6 text-foreground">{message}</p>
    </div>
  );
}

function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("es-BO", {
    timeZone: "America/La_Paz",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(Date.UTC(year, month - 1, day, 16)));
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("es-BO", {
    timeZone: "America/La_Paz",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
