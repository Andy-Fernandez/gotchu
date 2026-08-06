import { RouteSkeleton } from "@/components/ui/route-skeleton";

export default function BookingsPage() {
  return (
    <RouteSkeleton
      eyebrow="Operación diaria"
      title="Reservas"
      description="Aquí se consultarán reservas, citas manuales, cancelaciones, reprogramaciones y estados de ejecución."
    />
  );
}
