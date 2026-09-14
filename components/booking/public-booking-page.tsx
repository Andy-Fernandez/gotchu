import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock3,
  Scissors,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { GotchuAppIcon } from "@/components/brand/gotchu-app-icon";
import { PublicBookingCheckout } from "@/components/booking/public-booking-checkout";
import {
  PublicServicePicker,
  type PublicServicePickerOption,
} from "@/components/booking/public-service-picker";
import { PublicTimePicker } from "@/components/booking/public-time-picker";
import { formatBobMinorUnits } from "@/components/catalog/public-catalog-formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  getPublicBookingHref,
  type PublicBookingPageState,
} from "@/modules/scheduling/public-booking-page-state";
import {
  createPublicTimePickerOptions,
  formatPublicTime,
} from "@/modules/scheduling/public-time-picker-options";

type PublicBookingPageProps = {
  state: PublicBookingPageState;
};

const STEP_LABELS = ["Servicio", "Profesional", "Horario", "Tus datos"] as const;

export function PublicBookingPage({ state }: PublicBookingPageProps) {
  const { profile, selection } = state;
  const selectedDetails = selection.kind === "selected" ? selection : null;
  const selectedServices = selectedDetails
    ? selectedDetails.serviceIds.flatMap((serviceId) => {
        const service = profile.services.find((candidate) => candidate.id === serviceId);
        return service ? [service] : [];
      })
    : [];
  const barberPreference = selectedDetails?.barberPreference ?? null;
  const selectedBarber = barberPreference && barberPreference !== "any"
    ? profile.barbers.find((barber) => barber.id === barberPreference)
    : undefined;
  const eligibleBarbers = selectedDetails
    ? profile.barbers.filter((barber) =>
        selectedDetails.availability.selection.eligibleBarberIds.includes(barber.id)
      )
    : [];
  const selectedSlot = selectedDetails?.selectedSlot ?? null;
  const currentStep = getCurrentStep(state);
  const shopHref = `/barberias/${encodeURIComponent(profile.shop.slug)}`;
  const bookingPath = `${shopHref}/reservar`;
  const backHref = getBackHref(state, currentStep);
  const combinedServiceName = selectedServices.map((service) => service.name).join(" + ");
  const depositMinorUnits = selectedServices.reduce(
    (total, service) => total + service.depositMinorUnits,
    0,
  );

  return (
    <main className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto grid h-14 w-full max-w-5xl grid-cols-[2.75rem_1fr_2.75rem] items-center px-2 sm:px-4">
          <Button asChild variant="ghost" size="icon">
            <Link href={backHref} aria-label={currentStep === 1 ? "Volver a la barbería" : "Volver al paso anterior"}>
              <ArrowLeft aria-hidden="true" />
            </Link>
          </Button>
          <p className="text-center text-body-sm font-semibold">Nueva reserva</p>
          <Link
            href={shopHref}
            aria-label="Ir al perfil de la barbería"
            className="flex min-h-11 min-w-11 items-center justify-end"
          >
            <GotchuAppIcon alt="" className="size-8" />
          </Link>
        </div>
      </header>

      <div className="border-b border-warning/20 bg-warning-subtle px-4 py-2 text-center text-caption font-medium text-warning">
        Vista previa · no crea reservas ni envía datos
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 pt-4 pb-10 sm:px-6 sm:pt-6 lg:px-8">
        <BookingProgress currentStep={currentStep} />

        <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section
            aria-labelledby="active-step-heading"
            className={currentStep === 4
              ? "min-w-0"
              : "min-w-0 md:rounded-xl md:border md:border-border md:bg-card md:p-6"}
          >
            {currentStep > 1 && currentStep < 4 && selectedDetails ? (
              <MobileSelectionSummary
                services={combinedServiceName}
                professional={barberPreference === "any"
                  ? "Cualquier profesional"
                  : selectedBarber?.displayName ?? "Por elegir"}
                editHref={getPublicBookingHref(profile.shop.slug, {
                  serviceIds: selectedDetails.serviceIds,
                  date: state.selectedDate,
                  step: "service",
                })}
              />
            ) : null}

            {currentStep === 1 ? (
              <ServiceStep
                state={state}
                initialSelectedIds={selectedDetails?.serviceIds ?? []}
              />
            ) : null}

            {currentStep === 2 && selectedDetails ? (
              <BarberStep
                state={state}
                eligibleBarbers={eligibleBarbers}
                selectedServiceName={combinedServiceName}
              />
            ) : null}

            {currentStep === 3 && selectedDetails && barberPreference ? (
              <ScheduleStep
                state={state}
                bookingPath={bookingPath}
              />
            ) : null}

            {currentStep === 4 && selectedDetails && selectedSlot ? (
              <div>
                <h1 id="active-step-heading" className="sr-only">Completa tus datos</h1>
                <PublicBookingCheckout
                  shopName={profile.shop.name}
                  serviceName={combinedServiceName}
                  professionalName={barberPreference === "any"
                    ? "Cualquier profesional"
                    : selectedBarber?.displayName ?? "Profesional por validar"}
                  dateLabel={formatLongDate(state.selectedDate)}
                  timeLabel={formatPublicTime(selectedSlot.startsAt)}
                  totalPriceMinorUnits={selectedDetails.availability.selection.totalPriceMinorUnits}
                  depositMinorUnits={depositMinorUnits}
                  bookingCode={getDemoBookingCode(state.selectedDate, selectedSlot.startsAt)}
                  timeZone={profile.shop.timezone}
                />
              </div>
            ) : null}
          </section>

          {selectedDetails && currentStep < 4 ? (
            <BookingSummaryAside
              state={state}
              serviceName={combinedServiceName}
              barberName={barberPreference === "any"
                ? "Cualquier profesional"
                : selectedBarber?.displayName ?? "Por elegir"}
              depositMinorUnits={depositMinorUnits}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}

function ServiceStep({
  state,
  initialSelectedIds,
}: {
  state: PublicBookingPageState;
  initialSelectedIds: readonly string[];
}) {
  const options: PublicServicePickerOption[] = state.profile.services.map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description,
    durationMinutes: service.durationMinutes,
    priceLabel: formatBobMinorUnits(service.priceMinorUnits),
    priceMinorUnits: service.priceMinorUnits,
    depositLabel: service.depositMinorUnits > 0
      ? formatBobMinorUnits(service.depositMinorUnits)
      : null,
  }));

  return (
    <div>
      <StepHeading
        title="¿Qué servicio quieres?"
        helper="Puedes elegir más de uno."
      />
      {state.selection.kind === "invalid" ? (
        <StatusMessage title="Revisa tu selección" message={state.selection.message} />
      ) : null}
      <div className="mt-5">
        <PublicServicePicker
          shopSlug={state.profile.shop.slug}
          services={options}
          initialSelectedIds={initialSelectedIds}
        />
      </div>
    </div>
  );
}

function BarberStep({
  state,
  eligibleBarbers,
  selectedServiceName,
}: {
  state: PublicBookingPageState;
  eligibleBarbers: PublicBookingPageState["profile"]["barbers"];
  selectedServiceName: string;
}) {
  if (state.selection.kind !== "selected") return null;
  const { selection, profile } = state;
  const baseOptions = {
    serviceIds: selection.serviceIds,
    date: state.selectedDate,
  } as const;

  return (
    <div>
      <StepHeading title="¿Con quién?" helper="Elige una opción para ver horarios." />

      {selection.barberError ? (
        <StatusMessage title="Ese profesional no está disponible" message={selection.barberError} />
      ) : null}

      {eligibleBarbers.length > 0 ? (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          <li>
            <Link
              href={getPublicBookingHref(profile.shop.slug, {
                ...baseOptions,
                barberId: "any",
              })}
              className="block rounded-lg"
              aria-label={`Elegir cualquier profesional para ${selectedServiceName}`}
            >
              <ChoiceCard
                icon="sparkles"
                title="Cualquier profesional"
                description="Más horarios disponibles"
                highlighted
              />
            </Link>
          </li>
          {eligibleBarbers.map((barber) => (
            <li key={barber.id}>
              <Link
                href={getPublicBookingHref(profile.shop.slug, {
                  ...baseOptions,
                  barberId: barber.id,
                })}
                className="block rounded-lg"
                aria-label={`Elegir a ${barber.displayName}`}
              >
                <ChoiceCard
                  initials={getInitials(barber.displayName)}
                  title={barber.displayName}
                  description="Profesional disponible"
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <StatusMessage
          title="No hay un profesional compatible"
          message="Cambia uno de los servicios para continuar."
          actionHref={getPublicBookingHref(profile.shop.slug, {
            serviceIds: selection.serviceIds,
            date: state.selectedDate,
            step: "service",
          })}
          actionLabel="Cambiar servicios"
        />
      )}
    </div>
  );
}

function ScheduleStep({
  state,
  bookingPath,
}: {
  state: PublicBookingPageState;
  bookingPath: string;
}) {
  if (state.selection.kind !== "selected") return null;
  const { selection, profile } = state;
  const barberPreference = selection.barberPreference;
  if (!barberPreference) return null;
  const timePickerOptions = createPublicTimePickerOptions(selection.availability.slots);

  return (
    <div>
      <StepHeading title="¿Cuándo?" helper="Hora local de Bolivia." />

      {state.dateError ? (
        <StatusMessage title="Revisa la fecha" message={state.dateError} />
      ) : null}
      {selection.slotError ? (
        <StatusMessage title="Ese horario cambió" message={selection.slotError} />
      ) : null}

      <div className="mt-5">
        <p className="text-body-sm font-semibold">Fecha</p>
        <ul
          className="scrollbar-none -mx-4 mt-3 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
          aria-label="Fechas disponibles"
        >
          {state.dateOptions.map((date) => {
            const isSelected = date === state.selectedDate;
            return (
              <li key={date} className="shrink-0 snap-start">
                <Link
                  href={getPublicBookingHref(profile.shop.slug, {
                    serviceIds: selection.serviceIds,
                    barberId: barberPreference,
                    date,
                  })}
                  aria-current={isSelected ? "date" : undefined}
                  aria-label={`Ver horarios del ${formatLongDate(date)}`}
                  className={`flex min-h-16 w-16 flex-col items-center justify-center rounded-md border px-2 text-center transition-colors ${
                    isSelected
                      ? "border-foreground bg-foreground text-primary-foreground"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  <span className="text-caption font-medium capitalize">{formatWeekday(date)}</span>
                  <span className="mt-1 font-semibold">{formatDay(date)}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <details className="group mt-2">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-body-sm font-semibold text-accent-foreground marker:content-none">
            Elegir otra fecha
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <form action={bookingPath} method="get" className="mt-2 grid gap-3 rounded-lg border border-border bg-muted p-3 sm:grid-cols-[1fr_auto] sm:items-end">
            {selection.serviceIds.map((serviceId) => (
              <input key={serviceId} type="hidden" name="service" value={serviceId} />
            ))}
            <input type="hidden" name="barber" value={barberPreference} />
            <Field label="Fecha exacta">
              <Input
                type="date"
                name="date"
                min={state.bookingWindow.startsOn}
                max={state.bookingWindow.endsOn}
                defaultValue={state.selectedDate}
              />
            </Field>
            <Button type="submit" variant="secondary">Ver horarios</Button>
          </form>
        </details>
      </div>

      <Separator className="my-5" />

      {timePickerOptions.quickOptions.length > 0 ? (
        <PublicTimePicker
          bookingPath={bookingPath}
          serviceIds={selection.serviceIds}
          barberPreference={barberPreference}
          date={state.selectedDate}
          periodGroups={timePickerOptions.periodGroups}
          quickOptions={timePickerOptions.quickOptions}
          showProfessionalCount={barberPreference === "any"}
        />
      ) : (
        <StatusMessage
          title="No hay horarios este día"
          message="Prueba otra fecha o vuelve a cambiar de profesional."
        />
      )}
    </div>
  );
}

function BookingProgress({ currentStep }: { currentStep: number }) {
  return (
    <div aria-live="polite">
      <div className="flex items-center justify-between gap-4 text-body-sm">
        <p className="font-semibold">Paso {currentStep} de {STEP_LABELS.length}</p>
        <p className="text-muted-foreground">{STEP_LABELS[currentStep - 1]}</p>
      </div>
      <ol className="mt-3 grid grid-cols-4 gap-2" aria-label="Progreso de la reserva">
        {STEP_LABELS.map((label, index) => {
          const step = index + 1;
          const isCurrent = step === currentStep;
          const isComplete = step < currentStep;
          return (
            <li key={label} aria-current={isCurrent ? "step" : undefined}>
              <span
                aria-hidden="true"
                className={`block h-1.5 rounded-full ${
                  isCurrent || isComplete ? "bg-foreground" : "bg-border"
                }`}
              />
              <span className="sr-only">
                {label}{isComplete ? ", completado" : isCurrent ? ", actual" : ""}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StepHeading({ title, helper }: { title: string; helper: string }) {
  return (
    <div>
      <h1 id="active-step-heading" tabIndex={-1} className="text-title-md tracking-tight outline-none sm:text-3xl">
        {title}
      </h1>
      <p className="mt-1 text-body-sm text-muted-foreground">{helper}</p>
    </div>
  );
}

function ChoiceCard({
  title,
  description,
  initials,
  icon,
  highlighted = false,
}: {
  title: string;
  description: string;
  initials?: string;
  icon?: "sparkles";
  highlighted?: boolean;
}) {
  return (
    <Card
      size="sm"
      className={`h-full transition-colors hover:border-input hover:bg-muted active:bg-accent ${
        highlighted ? "border-accent-foreground/30 bg-accent" : ""
      }`}
    >
      <CardContent className="flex min-h-20 items-center gap-3 p-4">
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-full font-semibold ${
          highlighted ? "bg-foreground text-primary-foreground" : "bg-muted"
        }`}>
          {icon === "sparkles" ? <Sparkles className="size-4" aria-hidden="true" /> : initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{title}</span>
          <span className="mt-1 block text-body-sm text-muted-foreground">{description}</span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </CardContent>
    </Card>
  );
}

function MobileSelectionSummary({
  services,
  professional,
  editHref,
}: {
  services: string;
  professional: string;
  editHref: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3 rounded-lg border border-border bg-card p-3 lg:hidden">
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-sm font-semibold">{services}</p>
        <p className="mt-0.5 truncate text-caption text-muted-foreground">{professional}</p>
      </div>
      <Button asChild variant="link" className="px-2">
        <Link href={editHref}>Editar</Link>
      </Button>
    </div>
  );
}

function BookingSummaryAside({
  state,
  serviceName,
  barberName,
  depositMinorUnits,
}: {
  state: PublicBookingPageState;
  serviceName: string;
  barberName: string;
  depositMinorUnits: number;
}) {
  if (state.selection.kind !== "selected") return null;
  const { selection, profile } = state;

  return (
    <aside className="sticky top-24 hidden lg:block" aria-labelledby="booking-summary-heading">
      <Card className="gap-0 py-0">
        <CardContent className="p-5">
          <p className="text-caption font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Tu selección
          </p>
          <h2 id="booking-summary-heading" className="mt-1 font-semibold">{profile.shop.name}</h2>

          <dl className="mt-5 space-y-4 text-body-sm">
            <SummaryItem
              icon={Scissors}
              label="Servicios"
              value={serviceName}
              editHref={getPublicBookingHref(profile.shop.slug, {
                serviceIds: selection.serviceIds,
                date: state.selectedDate,
                step: "service",
              })}
            />
            <SummaryItem
              icon={UserRound}
              label="Profesional"
              value={barberName}
              editHref={selection.barberPreference
                ? getPublicBookingHref(profile.shop.slug, {
                    serviceIds: selection.serviceIds,
                    barberId: selection.barberPreference,
                    date: state.selectedDate,
                    step: "barber",
                  })
                : undefined}
            />
            <SummaryItem
              icon={CalendarDays}
              label="Fecha"
              value={selection.barberPreference ? formatLongDate(state.selectedDate) : "Por elegir"}
            />
          </dl>

          <Separator className="my-5" />
          <dl className="space-y-3 text-body-sm">
            <SummaryAmount
              label="Total"
              value={formatBobMinorUnits(selection.availability.selection.totalPriceMinorUnits)}
              emphasis
            />
            <SummaryAmount
              label="Anticipo"
              value={depositMinorUnits > 0 ? formatBobMinorUnits(depositMinorUnits) : "No requiere"}
            />
          </dl>
          <p className="mt-4 flex gap-2 text-caption leading-5 text-muted-foreground">
            <Clock3 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Precio y horario de esta vista son demostrativos.
          </p>
        </CardContent>
      </Card>
    </aside>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  value,
  editHref,
}: {
  icon: typeof Scissors;
  label: string;
  value: string;
  editHref?: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <dt className="text-caption text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-pretty font-semibold">{value}</dd>
      </div>
      {editHref ? (
        <Link href={editHref} className="inline-flex min-h-11 items-center text-caption font-semibold text-accent-foreground hover:underline">
          Cambiar
        </Link>
      ) : null}
    </div>
  );
}

function SummaryAmount({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={emphasis ? "text-body font-semibold" : "font-semibold"}>{value}</dd>
    </div>
  );
}

function StatusMessage({
  title,
  message,
  actionHref,
  actionLabel,
}: {
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div role="status" aria-live="polite" className="mt-4 rounded-lg border border-information/25 bg-information-subtle p-4">
      <p className="font-semibold text-information">{title}</p>
      <p className="mt-1 text-body-sm text-foreground">{message}</p>
      {actionHref && actionLabel ? (
        <Button asChild variant="link" className="mt-2 h-11 px-0">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}

function getCurrentStep(state: PublicBookingPageState): number {
  if (state.selection.kind !== "selected") return 1;
  if (state.requestedStep === "service") return 1;
  if (state.requestedStep === "barber") return 2;
  if (state.selection.barberPreference === null) return 2;
  return state.selection.selectedSlot ? 4 : 3;
}

function getBackHref(state: PublicBookingPageState, currentStep: number): string {
  const shopSlug = state.profile.shop.slug;
  if (state.selection.kind !== "selected" || currentStep === 1) {
    return `/barberias/${encodeURIComponent(shopSlug)}`;
  }
  if (currentStep === 2) {
    return getPublicBookingHref(shopSlug, {
      serviceIds: state.selection.serviceIds,
      date: state.selectedDate,
      step: "service",
    });
  }
  if (currentStep === 3) {
    return getPublicBookingHref(shopSlug, {
      serviceIds: state.selection.serviceIds,
      barberId: state.selection.barberPreference ?? undefined,
      date: state.selectedDate,
      step: "barber",
    });
  }
  return getPublicBookingHref(shopSlug, {
    serviceIds: state.selection.serviceIds,
    barberId: state.selection.barberPreference ?? undefined,
    date: state.selectedDate,
  });
}

function formatWeekday(date: string) {
  return formatDate(date, { weekday: "short" }).replace(".", "");
}

function formatDay(date: string) {
  return formatDate(date, { day: "numeric", month: "short" }).replace(".", "");
}

function formatLongDate(date: string) {
  return formatDate(date, { weekday: "long", day: "numeric", month: "long" });
}

function formatDate(
  date: string,
  options: Intl.DateTimeFormatOptions,
) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("es-BO", {
    ...options,
    timeZone: "America/La_Paz",
  }).format(new Date(Date.UTC(year, month - 1, day, 16)));
}

function getInitials(name: string) {
  return name
    .replace(/\([^)]*\)/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "G";
}

function getDemoBookingCode(date: string, startsAt: Date) {
  const compactDate = date.replaceAll("-", "").slice(2);
  const compactTime = formatPublicTime(startsAt).replace(":", "");
  return `GOT-DEMO-${compactDate}-${compactTime}`;
}
