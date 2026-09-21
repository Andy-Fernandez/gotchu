import { Skeleton } from "@/components/ui/skeleton";

export default function ServiceHistoryLoading() {
  return (
    <div
      className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Cargando historial de servicios</span>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-10 w-full max-w-sm" />
      <Skeleton className="mt-3 h-5 w-full max-w-xl" />

      <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-lg" />
        ))}
      </div>

      <div className="mt-6 flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-11 w-28 shrink-0 rounded-full" />
        ))}
      </div>

      <div className="mt-8 grid gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-44 rounded-lg sm:h-36" />
        ))}
      </div>
    </div>
  );
}
