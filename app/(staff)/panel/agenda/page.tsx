import { RouteSkeleton } from "@/components/ui/route-skeleton";

export default function SchedulePage() {
  return (
    <RouteSkeleton
      eyebrow="Operación diaria"
      title="Agenda compartida"
      description="Reservas online, citas manuales, holds activos, walk-ins y servicios en curso convergerán en esta única agenda."
    />
  );
}
