import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Scissors,
  SearchX,
  UserRound,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  formatServiceDate,
  formatServiceItems,
  formatServiceTimeRange,
  getServiceSourceLabel,
  getTotalServiceDuration,
} from "@/components/history/service-history-formatters";
import { ServiceStatusBadge } from "@/components/history/service-status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  countServiceHistory,
  filterServiceHistory,
  getServiceHistory,
  parseServiceHistoryFilter,
} from "@/modules/operations/get-service-history";
import type {
  ServiceHistoryCounts,
  ServiceHistoryFilter,
  ServiceHistoryRecord,
} from "@/modules/operations/service-history-types";

export const metadata: Metadata = {
  title: "Historial de servicios",
};

type ServiceHistoryPageProps = {
  searchParams: Promise<{ estado?: string | string[] }>;
};

const historyFilters: Array<{
  value: ServiceHistoryFilter;
  label: string;
  href: string;
}> = [
  { value: "todos", label: "Todos", href: "/panel/reservas" },
  {
    value: "pendientes",
    label: "Pendientes",
    href: "/panel/reservas?estado=pendientes",
  },
  {
    value: "confirmados",
    label: "Confirmados",
    href: "/panel/reservas?estado=confirmados",
  },
  {
    value: "realizados",
    label: "Realizados",
    href: "/panel/reservas?estado=realizados",
  },
];

export default async function ServiceHistoryPage({
  searchParams,
}: ServiceHistoryPageProps) {
  const [{ estado }, records] = await Promise.all([
    searchParams,
    getServiceHistory(),
  ]);
  const activeFilter = parseServiceHistoryFilter(estado);
  const counts = countServiceHistory(records);
  const visibleRecords = filterServiceHistory(records, activeFilter);
  const activeFilterLabel = historyFilters.find(
    (filter) => filter.value === activeFilter,
  )?.label;

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-caption font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Operación diaria
              </p>
              <Badge variant="outline" className="h-6 bg-card px-2.5">
                Vista demo · datos ficticios
              </Badge>
            </div>
            <h1 className="mt-3 text-title-lg tracking-tight text-balance sm:text-4xl">
              Historial de servicios
            </h1>
            <p className="mt-2 max-w-xl text-body-sm leading-6 text-muted-foreground sm:text-body">
              Revisa el estado de cada cita y entra a su detalle sin perder el
              contexto de la agenda.
            </p>
          </div>
          <p className="text-body-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{counts.todos}</span>{" "}
            registros
          </p>
        </header>

        <section className="mt-6" aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="sr-only">
            Resumen por estado
          </h2>
          <div className="grid grid-cols-3 divide-x divide-border overflow-hidden rounded-lg border border-border bg-card">
            <StatusCount
              label="Pendientes"
              count={counts.pendientes}
              className="text-warning"
            />
            <StatusCount
              label="Confirmados"
              count={counts.confirmados}
              className="text-information"
            />
            <StatusCount
              label="Realizados"
              count={counts.realizados}
              className="text-success"
            />
          </div>
        </section>

        <nav
          className="scrollbar-none mt-6 flex gap-2 overflow-x-auto pb-1"
          aria-label="Filtrar historial por estado"
        >
          {historyFilters.map((filter) => {
            const isCurrent = filter.value === activeFilter;

            return (
              <Link
                key={filter.value}
                href={filter.href}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-body-sm font-semibold transition-colors",
                  isCurrent
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card hover:border-input hover:bg-muted",
                )}
              >
                {filter.label}
                <span
                  className={cn(
                    "inline-flex min-w-5 justify-center rounded-full px-1.5 text-caption",
                    isCurrent ? "bg-white/15" : "bg-muted text-muted-foreground",
                  )}
                >
                  {counts[filter.value]}
                </span>
              </Link>
            );
          })}
        </nav>

        <section className="mt-7" aria-labelledby="history-list-heading">
          <div className="flex flex-col items-start justify-between gap-1 sm:flex-row sm:items-center sm:gap-4">
            <h2 id="history-list-heading" className="text-title-sm tracking-tight">
              {activeFilterLabel}
            </h2>
            <p className="text-caption text-muted-foreground">
              Fecha de cita · hora de La Paz
            </p>
          </div>

          {visibleRecords.length > 0 ? (
            <ul className="mt-4 grid gap-3">
              {visibleRecords.map((record) => (
                <li key={record.id}>
                  <ServiceHistoryCard record={record} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyHistory counts={counts} />
          )}
        </section>
      </div>
    </div>
  );
}

function StatusCount({
  label,
  count,
  className,
}: {
  label: string;
  count: number;
  className: string;
}) {
  return (
    <div className="min-w-0 px-2 py-3 text-center sm:px-4 sm:py-4">
      <span
        className={cn(
          "text-title-sm font-bold",
          className,
        )}
      >
        {count}
      </span>
      <p className="mt-1 text-caption font-semibold sm:text-body-sm">
        {label}
      </p>
    </div>
  );
}

function ServiceHistoryCard({ record }: { record: ServiceHistoryRecord }) {
  const services = formatServiceItems(record.items);
  const durationMinutes = getTotalServiceDuration(record.items);

  return (
    <Link
      href={`/panel/reservas/${encodeURIComponent(record.id)}`}
      aria-label={`Ver detalle de ${services} para ${record.customerName}`}
      className="group block rounded-lg"
    >
      <Card className="gap-0 py-0 transition-colors group-hover:border-input group-hover:bg-muted/40 group-active:bg-accent">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-5">
            <p className="flex min-w-0 items-center gap-2 text-body-sm font-medium">
              <CalendarDays
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <time dateTime={record.scheduledStart}>
                {formatServiceDate(record.scheduledStart)}
              </time>
            </p>
            <ServiceStatusBadge status={record.bookingStatus} />
          </div>

          <div className="grid gap-4 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5">
            <div className="min-w-0">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                  <Scissors className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-body font-semibold text-balance sm:text-title-sm">
                    {services}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-body-sm text-muted-foreground">
                    <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{record.customerName}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-caption text-muted-foreground sm:ml-13">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-3.5" aria-hidden="true" />
                  {formatServiceTimeRange(
                    record.scheduledStart,
                    record.scheduledEnd,
                  )}{" "}
                  · {durationMinutes} min
                </span>
                <span>{record.assignedBarberName}</span>
                <span>{getServiceSourceLabel(record.source)}</span>
              </div>
            </div>

            <span className="inline-flex min-h-11 items-center justify-between gap-2 border-t border-border pt-3 text-body-sm font-semibold text-accent-foreground group-hover:text-accent-hover sm:min-h-0 sm:border-t-0 sm:pt-0">
              Ver detalle
              <ChevronRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyHistory({ counts }: { counts: ServiceHistoryCounts }) {
  return (
    <Card className="mt-4">
      <CardContent className="flex flex-col items-center px-5 py-10 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-muted">
          <SearchX className="size-5 text-muted-foreground" aria-hidden="true" />
        </span>
        <h3 className="mt-4 font-semibold">No hay servicios en este estado</h3>
        <p className="mt-2 max-w-sm text-body-sm leading-6 text-muted-foreground">
          Prueba otro filtro para consultar los {counts.todos} registros de esta
          vista demo.
        </p>
        <Link
          href="/panel/reservas"
          className="mt-4 inline-flex min-h-11 items-center rounded-md px-4 text-button text-accent-foreground hover:text-accent-hover hover:underline"
        >
          Ver todos
        </Link>
      </CardContent>
    </Card>
  );
}
