"use client";

import { Check, ChevronDown } from "lucide-react";
import Form from "next/form";
import { useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  PublicTimeOption,
  PublicTimePeriodGroup,
  PublicTimePeriodId,
} from "@/modules/scheduling/public-time-picker-options";

type PublicTimePickerProps = {
  bookingPath: string;
  serviceIds: readonly string[];
  barberPreference: string;
  date: string;
  periodGroups: readonly PublicTimePeriodGroup[];
  quickOptions: readonly PublicTimeOption[];
  showProfessionalCount: boolean;
};

export function PublicTimePicker({
  bookingPath,
  serviceIds,
  barberPreference,
  date,
  periodGroups,
  quickOptions,
  showProfessionalCount,
}: PublicTimePickerProps) {
  const [candidateToken, setCandidateToken] = useState("");
  const [selectedPeriodId, setSelectedPeriodId] = useState<PublicTimePeriodId>(
    periodGroups.find((group) => group.options.length > 0)?.id ?? "morning",
  );
  const options = periodGroups.flatMap((group) => group.options);
  const selectedOption = options.find((option) => option.token === candidateToken) ?? null;
  const selectedToken = selectedOption?.token ?? "";
  const selectedPeriod = periodGroups.find(
    (group) => group.id === selectedPeriodId && group.options.length > 0,
  ) ?? periodGroups.find((group) => group.options.length > 0);
  const hasMoreOptions = options.length > quickOptions.length;

  function selectTime(option: PublicTimeOption) {
    setCandidateToken(option.token);
    setSelectedPeriodId(option.periodId);
  }

  return (
    <Form action={bookingPath} className="space-y-4">
      {serviceIds.map((serviceId) => (
        <input key={serviceId} type="hidden" name="service" value={serviceId} />
      ))}
      <input type="hidden" name="barber" value={barberPreference} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="slot" value={selectedToken} />

      <fieldset>
        <legend className="text-body-sm font-semibold">Opciones rápidas</legend>
        <div
          className={cn(
            "mt-3 grid gap-2",
            quickOptions.length === 1 ? "grid-cols-1" : "grid-cols-2",
            quickOptions.length === 3 && "grid-cols-3",
          )}
        >
          {quickOptions.map((option, index) => (
            <TimeButton
              key={option.token}
              option={option}
              helper={index === 0 ? "Más temprano" : option.periodLabel}
              selected={selectedToken === option.token}
              onSelect={selectTime}
            />
          ))}
        </div>
      </fieldset>

      {hasMoreOptions ? (
        <details className="group rounded-lg border border-border bg-card open:pb-3">
          <summary
            aria-controls="all-public-time-options"
            className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-body-sm font-semibold marker:content-none"
          >
            Ver todos los horarios
            <ChevronDown
              className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>

          <div id="all-public-time-options" className="border-t border-border px-3 pt-3">
            <fieldset>
              <legend className="sr-only">Filtrar horarios por momento del día</legend>
              <div className="grid grid-cols-3 gap-1 rounded-md bg-muted p-1">
                {periodGroups.map((period) => {
                  const isSelected = period.id === selectedPeriod?.id;
                  const isEmpty = period.options.length === 0;

                  return (
                    <button
                      key={period.id}
                      type="button"
                      aria-pressed={isSelected}
                      aria-label={isEmpty ? `${period.label}, sin horarios` : undefined}
                      disabled={isEmpty}
                      onClick={() => setSelectedPeriodId(period.id)}
                      className={cn(
                        "flex min-h-12 flex-col items-center justify-center rounded-sm px-1 text-body-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                        isSelected
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                      )}
                    >
                      <span>{period.label}</span>
                      <span className="text-caption font-normal">
                        {isEmpty ? "Sin horarios" : period.options.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {selectedPeriod ? (
              <fieldset className="mt-3">
                <legend className="sr-only">Horarios de {selectedPeriod.label.toLowerCase()}</legend>
                <p aria-live="polite" className="mb-3 text-caption text-muted-foreground">
                  {selectedPeriod.options.length} {selectedPeriod.options.length === 1 ? "horario" : "horarios"} en {selectedPeriod.label.toLowerCase()}
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {selectedPeriod.options.map((option) => (
                    <TimeButton
                      key={option.token}
                      option={option}
                      selected={selectedToken === option.token}
                      onSelect={selectTime}
                    />
                  ))}
                </div>
              </fieldset>
            ) : null}
          </div>
        </details>
      ) : null}

      <p aria-live="polite" className="min-h-5 text-center text-caption text-muted-foreground">
        {selectedOption
          ? getSelectedTimeMessage(selectedOption, showProfessionalCount)
          : "Elige una hora para continuar."}
      </p>

      <ContinueButton timeLabel={selectedOption?.label ?? null} />
    </Form>
  );
}

function TimeButton({
  option,
  helper,
  selected,
  onSelect,
}: {
  option: PublicTimeOption;
  helper?: string;
  selected: boolean;
  onSelect: (option: PublicTimeOption) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(option)}
      className={cn(
        "relative flex min-h-12 touch-manipulation flex-col items-center justify-center rounded-md border px-2 text-center transition-colors",
        selected
          ? "border-foreground bg-foreground text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-input hover:bg-muted active:bg-accent",
      )}
    >
      {selected ? (
        <Check className="absolute top-1.5 end-1.5 size-3.5" aria-hidden="true" />
      ) : null}
      <span className="font-semibold tabular-nums">{option.label}</span>
      {helper ? (
        <span className={cn(
          "mt-0.5 text-caption",
          selected ? "text-primary-foreground" : "text-muted-foreground",
        )}>
          {helper}
        </span>
      ) : null}
    </button>
  );
}

function ContinueButton({ timeLabel }: { timeLabel: string | null }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="w-full" disabled={!timeLabel} loading={pending}>
      {timeLabel ? `Continuar · ${timeLabel}` : "Continuar"}
    </Button>
  );
}

function getSelectedTimeMessage(option: PublicTimeOption, showProfessionalCount: boolean) {
  if (!showProfessionalCount) {
    return `Horario elegido: ${option.label}.`;
  }

  return `Horario elegido: ${option.label} · ${option.professionalCount} ${
    option.professionalCount === 1 ? "profesional disponible" : "profesionales disponibles"
  }.`;
}
