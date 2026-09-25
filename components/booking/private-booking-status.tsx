import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CalendarPlus,
  Check,
  CircleCheck,
  Clock3,
  FileCheck,
  LockKeyhole,
  MapPin,
  ReceiptText,
  Scissors,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { GotchuConfirmationMark } from "@/components/brand/gotchu-confirmation-mark";
import { GotchuWordmark } from "@/components/brand/gotchu-wordmark";
import { formatBobMinorUnits } from "@/components/catalog/public-catalog-formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getBookingStatusPresentation,
  type BookingStatusStep,
  type DemoBookingStatus,
  type DemoPrivateBooking,
} from "@/modules/booking/demo-private-booking";

type BookingSubmissionCompleteProps = {
  booking: DemoPrivateBooking;
  statusHref: string;
};

type PrivateBookingStatusProps = {
  booking: DemoPrivateBooking;
  status: DemoBookingStatus;
  pendingHref: string;
  confirmedHref: string;
};

export function BookingSubmissionComplete({
  booking,
  statusHref,
}: BookingSubmissionCompleteProps) {
  const requiresDeposit = booking.depositMinorUnits > 0;
  const isImmediatelyConfirmed = !requiresDeposit;
  const shopHref = `/barberias/${encodeURIComponent(booking.shopSlug)}`;

  return (
    <DemoBookingFrame sectionLabel="Solicitud">
      <main className="mx-auto w-full max-w-xl px-4 py-6 sm:px-6 sm:py-10">
        <Card className="gap-0 overflow-hidden py-0 shadow-sm">
          <div
            className="h-1 [background:var(--brand-sheen)]"
            aria-hidden="true"
          />
          <CardContent className="p-5 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-foreground text-primary-foreground">
                <FileCheck className="size-7" aria-hidden="true" />
              </span>

              <Badge
                className={`mt-5 h-7 px-3 ${
                  isImmediatelyConfirmed
                    ? "bg-success-subtle text-success"
                    : "bg-warning-subtle text-warning"
                }`}
              >
                {isImmediatelyConfirmed ? (
                  <CircleCheck data-icon="inline-start" aria-hidden="true" />
                ) : (
                  <Clock3 data-icon="inline-start" aria-hidden="true" />
                )}
                Ejemplo ·{" "}
                {isImmediatelyConfirmed
                  ? "Confirmada"
                  : "Pendiente de revisión"}
              </Badge>

              <p className="mt-5 text-caption font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Fin del flujo de reserva
              </p>
              <h1 className="mt-2 text-title-lg tracking-tight text-balance">
                ¡Listo! Solicitud enviada
              </h1>
              <p className="mt-3 max-w-md text-body text-muted-foreground text-pretty">
                {requiresDeposit
                  ? `Tu horario quedó protegido mientras ${booking.shopName} revisa el anticipo. Por ahora no necesitas hacer nada.`
                  : `Tu solicitud quedó registrada en ${booking.shopName}. Ya no necesitas completar ningún otro paso.`}
              </p>
            </div>

            <div
              role="status"
              aria-live="polite"
              className="mt-6 flex gap-3 rounded-lg border border-information/25 bg-information-subtle p-4"
            >
              <ShieldCheck
                className="mt-0.5 size-5 shrink-0 text-information"
                aria-hidden="true"
              />
              <div className="text-body-sm">
                <p className="font-semibold text-information">
                  Vista de demostración
                </p>
                <p className="mt-1 text-foreground">
                  No se creó una reserva real y ningún comprobante fue enviado.
                </p>
              </div>
            </div>

            {!isImmediatelyConfirmed ? (
              <div className="mt-4 flex gap-3 rounded-lg border border-warning/25 bg-warning-subtle p-4 text-body-sm">
                <Clock3
                  className="mt-0.5 size-5 shrink-0 text-warning"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold text-warning">
                    Pendiente de revisión
                  </p>
                  <p className="mt-1 text-foreground">
                    Revisaremos tu comprobante en un plazo de hasta 2 horas
                    durante nuestro horario de atención.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="mt-6">
              <BookingSnapshot booking={booking} compact />
            </div>

            <div className="mt-6 grid gap-3">
              <Button asChild size="lg" className="w-full">
                <Link href={statusHref}>Ver ejemplo del estado</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="w-full">
                <Link href={shopHref}>Volver a la barbería</Link>
              </Button>
            </div>

            <p className="mt-5 flex items-start justify-center gap-2 text-center text-caption leading-5 text-muted-foreground">
              <LockKeyhole
                className="mt-0.5 size-3.5 shrink-0"
                aria-hidden="true"
              />
              En producción, este enlace será privado y permitirá consultar
              siempre el estado más reciente.
            </p>
          </CardContent>
        </Card>
      </main>
    </DemoBookingFrame>
  );
}

export function PrivateBookingStatus({
  booking,
  status,
  pendingHref,
  confirmedHref,
}: PrivateBookingStatusProps) {
  const requiresDeposit = booking.depositMinorUnits > 0;
  const presentation = getBookingStatusPresentation(status, requiresDeposit);
  const isConfirmed = status === "confirmed";
  const shopHref = `/barberias/${encodeURIComponent(booking.shopSlug)}`;
  const calendarHref = getCalendarHref(booking);

  return (
    <DemoBookingFrame sectionLabel="Estado de tu reserva">
      <main className="mx-auto w-full max-w-xl px-4 py-6 sm:px-6 sm:py-10">
        <section aria-labelledby="booking-status-heading" className="space-y-4">
          <Card className="gap-0 overflow-hidden py-0 shadow-sm">
            <div
              className="h-1 [background:var(--brand-sheen)]"
              aria-hidden="true"
            />
            <CardContent className="p-5 sm:p-8">
              <div className="flex flex-col items-center text-center">
                {presentation.showConfirmationMark ? (
                  <GotchuConfirmationMark className="size-20" />
                ) : (
                  <span className="flex size-16 items-center justify-center rounded-full bg-warning-subtle text-warning">
                    <Clock3 className="size-7" aria-hidden="true" />
                  </span>
                )}

                <Badge
                  className={`mt-5 h-7 px-3 ${
                    isConfirmed
                      ? "bg-success-subtle text-success"
                      : "bg-warning-subtle text-warning"
                  }`}
                >
                  {isConfirmed ? (
                    <CircleCheck data-icon="inline-start" aria-hidden="true" />
                  ) : (
                    <Clock3 data-icon="inline-start" aria-hidden="true" />
                  )}
                  {presentation.badgeLabel}
                </Badge>

                <h1
                  id="booking-status-heading"
                  className="mt-4 text-title-lg tracking-tight text-balance"
                >
                  {presentation.title}
                </h1>
                <p className="mt-3 max-w-md text-body text-muted-foreground text-pretty">
                  {presentation.description}
                </p>
              </div>

              {presentation.expectation ? (
                <div className="mt-6 flex gap-3 rounded-lg border border-warning/25 bg-warning-subtle p-4 text-body-sm">
                  <Clock3
                    className="mt-0.5 size-5 shrink-0 text-warning"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold text-warning">
                      Tiempo de revisión
                    </p>
                    <p className="mt-1 text-foreground">
                      {presentation.expectation}
                    </p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {!isConfirmed ? <ReviewProgress steps={presentation.steps} /> : null}

          <BookingSnapshot booking={booking} />

          <PaymentSummary
            booking={booking}
            depositStateLabel={presentation.depositStateLabel}
            isConfirmed={isConfirmed}
          />

          <details className="group rounded-lg border border-border bg-card">
            <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 font-semibold marker:content-none">
              <ShieldCheck
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="flex-1">Política de cambios y cancelación</span>
              <span className="text-body-sm font-medium text-accent-foreground group-open:hidden">
                Ver
              </span>
              <span className="hidden text-body-sm font-medium text-accent-foreground group-open:inline">
                Cerrar
              </span>
            </summary>
            <p className="border-t border-border px-4 py-4 text-body-sm leading-6 text-muted-foreground">
              {booking.policySummary}
            </p>
          </details>

          <div className="grid gap-3 pt-1">
            {isConfirmed ? (
              <Button asChild size="lg" className="w-full">
                <a
                  href={calendarHref}
                  download={`cita-${booking.bookingCode.toLowerCase()}.ics`}
                >
                  <CalendarPlus aria-hidden="true" />
                  Agregar al calendario
                </a>
              </Button>
            ) : null}
            <Button asChild variant="secondary" size="lg" className="w-full">
              <Link href={shopHref}>Volver a la barbería</Link>
            </Button>
          </div>

          <p className="flex items-start justify-center gap-2 px-2 pt-1 text-center text-caption leading-5 text-muted-foreground">
            <LockKeyhole
              className="mt-0.5 size-3.5 shrink-0"
              aria-hidden="true"
            />
            Guarda el enlace privado de esta página. La barbería también puede
            contactarte por WhatsApp.
          </p>

          <DemoStateSwitcher
            status={status}
            pendingHref={pendingHref}
            confirmedHref={confirmedHref}
          />
        </section>
      </main>
    </DemoBookingFrame>
  );
}

function DemoBookingFrame({
  sectionLabel,
  children,
}: {
  sectionLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="border-b border-warning/20 bg-warning-subtle px-4 py-2 text-center text-caption font-medium text-warning">
        Prototipo visual · no crea reservas ni envía comprobantes
      </div>
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 w-full max-w-xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            aria-label="Ir al inicio de Gotchu"
            className="flex min-h-11 items-center rounded-md"
          >
            <GotchuWordmark alt="Gotchu" className="w-28" />
          </Link>
          <p className="text-body-sm font-semibold text-muted-foreground">
            {sectionLabel}
          </p>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-border bg-card px-4 py-5 text-center text-caption text-muted-foreground">
        Gotchu · tu corte, asegurado
      </footer>
    </div>
  );
}

function ReviewProgress({ steps }: { steps: readonly BookingStatusStep[] }) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="p-5 sm:p-6">
        <h2 className="text-title-sm">Qué sigue</h2>
        <ol className="mt-5 space-y-0" aria-label="Progreso de confirmación">
          {steps.map((step, index) => (
            <li
              key={step.label}
              aria-current={step.state === "current" ? "step" : undefined}
              className="grid grid-cols-[2rem_1fr] gap-3"
            >
              <div className="flex flex-col items-center">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full border ${
                    step.state === "complete"
                      ? "border-foreground bg-foreground text-primary-foreground"
                      : step.state === "current"
                        ? "border-warning/30 bg-warning-subtle text-warning"
                        : "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  {step.state === "complete" ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : step.state === "current" ? (
                    <Clock3 className="size-4" aria-hidden="true" />
                  ) : (
                    <span
                      className="size-2 rounded-full bg-current"
                      aria-hidden="true"
                    />
                  )}
                </span>
                {index < steps.length - 1 ? (
                  <span className="h-8 w-px bg-border" aria-hidden="true" />
                ) : null}
              </div>
              <div className="pt-1">
                <p
                  className={
                    step.state === "upcoming"
                      ? "text-muted-foreground"
                      : "font-semibold"
                  }
                >
                  {step.label}
                </p>
                <p className="mt-0.5 text-caption text-muted-foreground">
                  {step.state === "complete"
                    ? "Completado"
                    : step.state === "current"
                      ? "En curso"
                      : "A continuación"}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function BookingSnapshot({
  booking,
  compact = false,
}: {
  booking: DemoPrivateBooking;
  compact?: boolean;
}) {
  const date = formatBookingDate(booking.startsAt, booking.timeZone);
  const time = formatBookingTimeRange(
    booking.startsAt,
    booking.serviceEndsAt,
    booking.timeZone,
  );

  return (
    <Card className="gap-0 py-0">
      <CardContent className={compact ? "p-4" : "p-5 sm:p-6"}>
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted">
            <CalendarDays className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-caption font-medium text-muted-foreground">
              Tu cita
            </p>
            <p className="mt-0.5 font-semibold text-pretty">{date}</p>
            <p className="mt-1 text-title-sm">
              {time}
              <span className="ml-2 text-body-sm font-normal text-muted-foreground">
                · hora de Bolivia
              </span>
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        <dl className="space-y-4">
          <BookingDetailRow
            icon={Scissors}
            label="Servicio"
            value={booking.serviceName}
            meta={`${booking.durationMinutes} min`}
          />
          <BookingDetailRow
            icon={UserRound}
            label="Profesional"
            value={booking.professionalName}
          />
          {!compact ? (
            <BookingDetailRow
              icon={MapPin}
              label="Barbería"
              value={booking.shopName}
              meta={booking.shopAddress}
            />
          ) : null}
          <BookingDetailRow
            icon={ReceiptText}
            label="Código"
            value={booking.bookingCode}
            mono
          />
        </dl>
      </CardContent>
    </Card>
  );
}

function BookingDetailRow({
  icon: Icon,
  label,
  value,
  meta,
  mono = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  meta?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <dt className="text-caption text-muted-foreground">{label}</dt>
        <dd
          className={`mt-0.5 break-words font-semibold ${mono ? "font-mono text-body-sm" : ""}`}
        >
          {value}
        </dd>
        {meta ? (
          <dd className="mt-0.5 text-body-sm text-muted-foreground">{meta}</dd>
        ) : null}
      </div>
    </div>
  );
}

function PaymentSummary({
  booking,
  depositStateLabel,
  isConfirmed,
}: {
  booking: DemoPrivateBooking;
  depositStateLabel: string;
  isConfirmed: boolean;
}) {
  const requiresDeposit = booking.depositMinorUnits > 0;

  return (
    <Card className="gap-0 py-0">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-caption font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              Pago
            </p>
            <h2 className="mt-1 text-title-sm">Resumen</h2>
          </div>
          <Badge
            className={`h-7 px-3 ${
              isConfirmed
                ? "bg-success-subtle text-success"
                : "bg-warning-subtle text-warning"
            }`}
          >
            {depositStateLabel}
          </Badge>
        </div>

        <dl className="mt-5 space-y-3 text-body-sm">
          <AmountRow
            label="Total"
            value={formatBobMinorUnits(booking.totalPriceMinorUnits)}
            emphasis
          />
          <AmountRow
            label="Anticipo"
            value={
              requiresDeposit
                ? formatBobMinorUnits(booking.depositMinorUnits)
                : "No requiere"
            }
          />
          <Separator />
          <AmountRow
            label="Saldo en la barbería"
            value={formatBobMinorUnits(booking.balanceMinorUnits)}
          />
        </dl>
      </CardContent>
    </Card>
  );
}

function AmountRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={emphasis ? "text-body font-semibold" : "font-semibold"}>
        {value}
      </dd>
    </div>
  );
}

function DemoStateSwitcher({
  status,
  pendingHref,
  confirmedHref,
}: {
  status: DemoBookingStatus;
  pendingHref: string;
  confirmedHref: string;
}) {
  return (
    <aside className="rounded-lg border border-information/25 bg-information-subtle p-4">
      <p className="text-caption font-semibold tracking-[0.12em] text-information uppercase">
        Control del prototipo
      </p>
      <p className="mt-1 text-body-sm text-foreground">
        Compara cómo cambia esta misma cita después de la revisión humana.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          asChild
          variant={
            status === "reserved_pending_review" ? "primary" : "secondary"
          }
        >
          <Link
            href={pendingHref}
            aria-current={
              status === "reserved_pending_review" ? "page" : undefined
            }
          >
            Pendiente
          </Link>
        </Button>
        <Button
          asChild
          variant={status === "confirmed" ? "primary" : "secondary"}
        >
          <Link
            href={confirmedHref}
            aria-current={status === "confirmed" ? "page" : undefined}
          >
            Confirmada
          </Link>
        </Button>
      </div>
    </aside>
  );
}

function formatBookingDate(instant: string, timeZone: string) {
  const formatted = new Intl.DateTimeFormat("es-BO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(new Date(instant));

  return `${formatted.charAt(0).toLocaleUpperCase("es-BO")}${formatted.slice(1)}`;
}

function formatBookingTimeRange(
  startsAt: string,
  endsAt: string,
  timeZone: string,
) {
  const formatter = new Intl.DateTimeFormat("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  });

  return `${formatter.format(new Date(startsAt))}–${formatter.format(new Date(endsAt))}`;
}

function getCalendarHref(booking: DemoPrivateBooking) {
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gotchu//Reserva demo//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${escapeCalendarText(booking.bookingCode)}@gotchu.app`,
    `DTSTART:${formatCalendarInstant(booking.startsAt)}`,
    `DTEND:${formatCalendarInstant(booking.serviceEndsAt)}`,
    `SUMMARY:${escapeCalendarText(`${booking.serviceName} · ${booking.shopName}`)}`,
    `LOCATION:${escapeCalendarText(booking.shopAddress)}`,
    `DESCRIPTION:${escapeCalendarText(`Con ${booking.professionalName}. Código ${booking.bookingCode}.`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(calendar)}`;
}

function formatCalendarInstant(instant: string) {
  return new Date(instant)
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(/\.\d{3}Z$/, "Z");
}

function escapeCalendarText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\n", "\\n");
}
