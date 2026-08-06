import Link from "next/link";
import { RouteSkeleton } from "@/components/ui/route-skeleton";

type ShopPageProps = {
  params: Promise<{ shopSlug: string }>;
};

export default async function ShopPage({ params }: ShopPageProps) {
  const { shopSlug } = await params;

  return (
    <main className="min-h-dvh">
      <RouteSkeleton
        eyebrow="Perfil público"
        title="Barbería"
        description="Aquí vivirá el perfil público con servicios, profesionales, horarios, políticas y disponibilidad autoritativa."
      >
        <Link
          href={`/barberias/${shopSlug}/reservar`}
          className="inline-flex min-h-11 items-center rounded-full bg-foreground px-5 font-medium text-background focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Comenzar reserva
        </Link>
      </RouteSkeleton>
    </main>
  );
}
