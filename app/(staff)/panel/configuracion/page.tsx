import { RouteSkeleton } from "@/components/ui/route-skeleton";

export default function SettingsPage() {
  return (
    <RouteSkeleton
      eyebrow="Owner"
      title="Configuración"
      description="Servicios, elegibilidad, horarios, descansos, anticipos y políticas se configurarán aquí con permisos de servidor."
    />
  );
}
