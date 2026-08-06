import { RouteSkeleton } from "@/components/ui/route-skeleton";

type BookingStatusPageProps = {
  params: Promise<{ accessToken: string }>;
};

export default async function BookingStatusPage({
  params,
}: BookingStatusPageProps) {
  await params;

  return (
    <main className="min-h-dvh">
      <RouteSkeleton
        eyebrow="Estado privado"
        title="Estado de tu reserva"
        description="La consulta real validará un token no adivinable y devolverá únicamente el DTO privado necesario para el cliente."
      />
    </main>
  );
}
