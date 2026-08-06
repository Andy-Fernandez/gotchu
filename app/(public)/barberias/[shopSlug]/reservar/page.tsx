import { RouteSkeleton } from "@/components/ui/route-skeleton";

type BookingPageProps = {
  params: Promise<{ shopSlug: string }>;
};

export default async function BookingPage({ params }: BookingPageProps) {
  await params;

  return (
    <main className="min-h-dvh">
      <RouteSkeleton
        eyebrow="Reserva pública"
        title="Servicio, profesional y horario"
        description="Este flujo compondrá catálogo, disponibilidad, hold, datos del cliente y carga del comprobante sin duplicar reglas del dominio."
      />
    </main>
  );
}
