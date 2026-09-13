"use client";

import { Check, Plus, Scissors } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type PublicServicePickerOption = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceLabel: string;
  priceMinorUnits: number;
  depositLabel: string | null;
};

type PublicServicePickerProps = {
  shopSlug: string;
  services: readonly PublicServicePickerOption[];
  initialSelectedIds?: readonly string[];
};

export function PublicServicePicker({
  shopSlug,
  services,
  initialSelectedIds = [],
}: PublicServicePickerProps) {
  const allowedIds = useMemo(() => new Set(services.map((service) => service.id)), [services]);
  const [selectedIds, setSelectedIds] = useState(() =>
    initialSelectedIds.filter((id) => allowedIds.has(id)),
  );
  const selectedSet = new Set(selectedIds);
  const selectedServices = services.filter((service) => selectedSet.has(service.id));
  const totalMinorUnits = selectedServices.reduce(
    (total, service) => total + service.priceMinorUnits,
    0,
  );
  const nextHref = buildBookingHref(shopSlug, selectedIds);

  function toggleService(serviceId: string) {
    setSelectedIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    );
  }

  return (
    <div>
      <ul className="grid gap-3" aria-label="Servicios disponibles">
        {services.map((service) => {
          const isSelected = selectedSet.has(service.id);

          return (
            <li key={service.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleService(service.id)}
                className="block w-full rounded-lg text-left"
              >
                <Card
                  size="sm"
                  className={isSelected
                    ? "border-foreground bg-accent shadow-sm"
                    : "transition-colors hover:bg-muted active:bg-accent"}
                >
                  <CardContent className="flex min-h-20 items-center gap-3 p-4">
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                        isSelected
                          ? "bg-foreground text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isSelected ? (
                        <Check className="size-4" aria-hidden="true" />
                      ) : (
                        <Scissors className="size-4" aria-hidden="true" />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{service.name}</span>
                      <span className="mt-1 block truncate text-body-sm text-muted-foreground">
                        {service.durationMinutes} min
                        {service.depositLabel ? ` · Anticipo ${service.depositLabel}` : " · Sin anticipo"}
                      </span>
                    </span>

                    <span className="shrink-0 text-right">
                      <span className="block font-semibold">{service.priceLabel}</span>
                      <span className="mt-1 inline-flex items-center gap-1 text-caption font-semibold text-muted-foreground">
                        {isSelected ? "Añadido" : "Añadir"}
                        {!isSelected ? <Plus className="size-3" aria-hidden="true" /> : null}
                      </span>
                    </span>
                  </CardContent>
                </Card>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="fixed inset-x-0 bottom-0 z-20 mt-5 border-t border-border bg-card/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-sticky backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:pt-5 md:shadow-none">
        {selectedIds.length > 0 ? (
          <Button asChild size="lg" className="w-full">
            <Link href={nextHref}>
              Continuar · {selectedIds.length} {selectedIds.length === 1 ? "servicio" : "servicios"} · {formatBob(totalMinorUnits)}
            </Link>
          </Button>
        ) : (
          <Button size="lg" className="w-full" disabled>
            Elige al menos un servicio
          </Button>
        )}
      </div>
    </div>
  );
}

function buildBookingHref(shopSlug: string, serviceIds: readonly string[]) {
  const searchParams = new URLSearchParams();
  for (const serviceId of serviceIds) searchParams.append("service", serviceId);
  return `/barberias/${encodeURIComponent(shopSlug)}/reservar?${searchParams.toString()}`;
}

function formatBob(minorUnits: number) {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(minorUnits / 100);
}
