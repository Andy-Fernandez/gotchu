import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Scissors,
  UserRound,
  WalletCards,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  formatBobMinorUnits,
  formatServiceDateTime,
  formatServiceItems,
  formatServiceTimeRange,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getServiceHistoryStatusPresentation,
  getServiceSourceLabel,
  getTotalServiceDuration,
} from "@/components/history/service-history-formatters";
import { ServiceStatusBadge } from "@/components/history/service-status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  getServiceHistory,
  getServiceHistoryRecord,
} from "@/modules/operations/get-service-history";
import type { ServiceHistoryRecord } from "@/modules/operations/service-history-types";

export const metadata: Metadata = {
  title: "Detalle del servicio",
};

type ServiceHistoryDetailPageProps = {
  params: Promise<{ bookingId: string }>;
};

export async function generateStaticParams() {
  const records = await getServiceHistory();

  return records.map((record) => ({ bookingId: record.id }));
}

export default async function ServiceHistoryDetailPage({
  params,
}: ServiceHistoryDetailPageProps) {
  const { bookingId } = await params;
  const record = await getServiceHistoryRecord(bookingId);

  if (!record) {
    notFound();
  }

  const status = getServiceHistoryStatusPresentation(record.bookingStatus);
  const services = formatServiceItems(record.items);

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <Link
          href="/panel/reservas"
          className="inline-flex min-h-11 items-center gap-2 rounded-md pr-3 text-body-sm font-semibold text-accent-foreground hover:text-accent-hover hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver al historial
        </Link>

        <article className="mt-3">
          <header>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-caption font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Detalle del servicio
              </p>
              <Badge variant="outline" className="h-6 bg-card px-2.5">
                Vista demo · datos ficticios
              </Badge>
            </div>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-title-lg tracking-tight text-balance sm:text-4xl">
                  {services}
                </h1>
                <p className="mt-2 flex items-center gap-2 text-body-sm text-muted-foreground sm:text-body">
                  <UserRound className="size-4 shrink-0" aria-hidden="true" />
                  {record.customerName}
                </p>
              </div>
              <ServiceStatusBadge status={record.bookingStatus} />
            </div>
          </header>

          <Card className="mt-6 gap-0 py-0">
            <CardContent className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-body-sm font-semibold text-muted-foreground">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  Fecha programada
                </p>
                <p className="mt-2 text-title-sm tracking-tight text-balance">
                  <time dateTime={record.scheduledStart}>
                    {formatServiceDateTime(record.scheduledStart)}
                  </time>
                </p>
                <p className="mt-2 text-body-sm text-muted-foreground">
                  {formatServiceTimeRange(
                    record.scheduledStart,
                    record.scheduledEnd,
                  )}{" "}
                  · {getTotalServiceDuration(record.items)} min de servicio
                </p>
              </div>
              <div className="rounded-lg bg-muted px-4 py-3 sm:max-w-xs">
                <p className="text-caption font-semibold text-muted-foreground">
                  Estado actual
                </p>
                <p className="mt-1 text-body-sm leading-6">
                  {status.description}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
            <DetailSection
              title="Datos de la cita"
              icon={<Scissors className="size-4" aria-hidden="true" />}
            >
              <dl className="divide-y divide-border">
                <DetailRow label="Cliente" value={record.customerName} />
                <DetailRow label="WhatsApp" value={record.customerWhatsapp} />
                <DetailRow
                  label="Profesional"
                  value={record.assignedBarberName}
                />
                <DetailRow
                  label="Origen"
                  value={getServiceSourceLabel(record.source)}
                />
                <DetailRow label="Código" value={record.bookingCode} mono />
              </dl>
            </DetailSection>

            <DetailSection
              title="Resumen de pago"
              icon={<WalletCards className="size-4" aria-hidden="true" />}
            >
              <dl className="divide-y divide-border">
                <DetailRow
                  label="Estado"
                  value={getPaymentStatusLabel(record.paymentStatus)}
                />
                <DetailRow
                  label="Total acordado"
                  value={formatBobMinorUnits(record.totalMinorUnits)}
                />
                <DetailRow
                  label="Anticipo aplicado"
                  value={formatBobMinorUnits(record.depositAppliedMinorUnits)}
                />
                <DetailRow
                  label="Saldo en barbería"
                  value={formatBobMinorUnits(record.remainingBalanceMinorUnits)}
                />
                {record.finalAmountMinorUnits !== undefined ? (
                  <DetailRow
                    label="Monto final"
                    value={formatBobMinorUnits(record.finalAmountMinorUnits)}
                  />
                ) : null}
                {record.paymentMethod ? (
                  <DetailRow
                    label="Método final"
                    value={getPaymentMethodLabel(record.paymentMethod)}
                  />
                ) : null}
              </dl>
            </DetailSection>

            <DetailSection
              title="Servicios incluidos"
              icon={<Scissors className="size-4" aria-hidden="true" />}
            >
              <ul className="divide-y divide-border">
                {record.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">{item.name}</p>
                      <p className="mt-1 text-caption text-muted-foreground">
                        {item.durationMinutes} minutos
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold">
                      {formatBobMinorUnits(item.priceMinorUnits)}
                    </p>
                  </li>
                ))}
              </ul>
            </DetailSection>

            <DetailSection
              title="Historial del estado"
              icon={<Clock3 className="size-4" aria-hidden="true" />}
            >
              <StatusTimeline record={record} />
            </DetailSection>
          </div>

          {record.actualStart && record.actualEnd ? (
            <Card className="mt-4">
              <CardContent className="grid gap-4 px-5 sm:grid-cols-2 sm:px-6">
                <div>
                  <p className="flex items-center gap-2 text-body-sm font-semibold">
                    <CheckCircle2
                      className="size-4 text-success"
                      aria-hidden="true"
                    />
                    Horario real
                  </p>
                  <p className="mt-2 text-body-sm text-muted-foreground">
                    {formatServiceTimeRange(
                      record.actualStart,
                      record.actualEnd,
                    )}
                  </p>
                </div>
                {record.completedByName ? (
                  <div>
                    <p className="text-body-sm font-semibold">Registrado por</p>
                    <p className="mt-2 text-body-sm text-muted-foreground">
                      {record.completedByName}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {record.note ? (
            <Card className="mt-4">
              <CardContent className="px-5 sm:px-6">
                <p className="flex items-center gap-2 text-body-sm font-semibold">
                  <MessageCircle className="size-4" aria-hidden="true" />
                  Nota operativa
                </p>
                <p className="mt-2 text-body-sm leading-6 text-muted-foreground">
                  {record.note}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </article>
      </div>
    </div>
  );
}

function DetailSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="px-5 sm:px-6">
        <h2 className="flex items-center gap-2 text-body font-semibold">
          {icon}
          {title}
        </h2>
        <div className="mt-4">{children}</div>
      </CardContent>
    </Card>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="text-body-sm text-muted-foreground">{label}</dt>
      <dd
        className={`min-w-0 text-right text-body-sm font-semibold break-words ${mono ? "font-mono" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function StatusTimeline({ record }: { record: ServiceHistoryRecord }) {
  const events = [
    record.receiptSubmittedAt
      ? {
          label: "Comprobante registrado",
          date: record.receiptSubmittedAt,
          icon: WalletCards,
        }
      : null,
    record.confirmedAt
      ? {
          label: "Reserva confirmada",
          date: record.confirmedAt,
          icon: CheckCircle2,
        }
      : null,
    record.completedAt
      ? {
          label: "Servicio realizado",
          date: record.completedAt,
          icon: CheckCircle2,
        }
      : null,
  ].filter((event): event is NonNullable<typeof event> => Boolean(event));

  if (events.length === 0) {
    return (
      <p className="text-body-sm leading-6 text-muted-foreground">
        Este registro todavía no tiene transiciones adicionales.
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {events.map((event) => {
        const Icon = event.icon;

        return (
          <li key={`${event.label}-${event.date}`} className="flex gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-body-sm font-semibold">{event.label}</p>
              <time
                dateTime={event.date}
                className="mt-1 block text-caption text-muted-foreground"
              >
                {formatServiceDateTime(event.date)}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
