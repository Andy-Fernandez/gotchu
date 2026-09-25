import type {
  ServiceHistoryBookingStatus,
  ServiceHistoryItem,
  ServiceHistoryPaymentMethod,
  ServiceHistoryPaymentStatus,
  ServiceHistorySource,
} from "../../modules/operations/service-history-types.ts";

export const SHOP_TIME_ZONE = "America/La_Paz";

const bobFormatter = new Intl.NumberFormat("es-BO", {
  style: "currency",
  currency: "BOB",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const serviceDateFormatter = new Intl.DateTimeFormat("es-BO", {
  timeZone: SHOP_TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});

const serviceDateTimeFormatter = new Intl.DateTimeFormat("es-BO", {
  timeZone: SHOP_TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const serviceTimeFormatter = new Intl.DateTimeFormat("es-BO", {
  timeZone: SHOP_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export type ServiceHistoryStatusTone = "warning" | "information" | "success";

export type ServiceHistoryStatusPresentation = {
  label: string;
  shortLabel: string;
  description: string;
  tone: ServiceHistoryStatusTone;
};

const statusPresentation: Record<
  ServiceHistoryBookingStatus,
  ServiceHistoryStatusPresentation
> = {
  reserved_pending_review: {
    label: "Pendiente de revisión",
    shortLabel: "Pendiente",
    description: "El anticipo fue enviado y aún requiere revisión humana.",
    tone: "warning",
  },
  confirmed: {
    label: "Confirmado",
    shortLabel: "Confirmado",
    description: "El horario está confirmado y protegido en la agenda.",
    tone: "information",
  },
  completed: {
    label: "Realizado",
    shortLabel: "Realizado",
    description: "El servicio se completó y quedó registrado.",
    tone: "success",
  },
};

const sourceLabels: Record<ServiceHistorySource, string> = {
  online: "Reserva en línea",
  whatsapp: "WhatsApp",
  phone: "Teléfono",
  in_person: "Cita presencial",
  walk_in: "Walk-in",
};

const paymentStatusLabels: Record<ServiceHistoryPaymentStatus, string> = {
  pending_review: "Anticipo pendiente de revisión",
  approved: "Anticipo aprobado",
  paid: "Pago final registrado",
};

const paymentMethodLabels: Record<ServiceHistoryPaymentMethod, string> = {
  shop_qr: "QR de la barbería",
  cash: "Efectivo",
  complimentary: "Cortesía",
  other: "Otro",
};

export function getServiceHistoryStatusPresentation(
  status: ServiceHistoryBookingStatus,
): ServiceHistoryStatusPresentation {
  return statusPresentation[status];
}

export function formatBobMinorUnits(minorUnits: number): string {
  return bobFormatter.format(minorUnits / 100);
}

export function formatServiceDate(isoDate: string): string {
  return serviceDateFormatter.format(new Date(isoDate));
}

export function formatServiceDateTime(isoDate: string): string {
  return serviceDateTimeFormatter.format(new Date(isoDate));
}

export function formatServiceTime(isoDate: string): string {
  return serviceTimeFormatter.format(new Date(isoDate));
}

export function formatServiceTimeRange(start: string, end: string): string {
  return `${formatServiceTime(start)}–${formatServiceTime(end)}`;
}

export function formatServiceItems(
  items: readonly ServiceHistoryItem[],
): string {
  return items.map((item) => item.name).join(" + ");
}

export function getTotalServiceDuration(
  items: readonly ServiceHistoryItem[],
): number {
  return items.reduce((total, item) => total + item.durationMinutes, 0);
}

export function getServiceSourceLabel(source: ServiceHistorySource): string {
  return sourceLabels[source];
}

export function getPaymentStatusLabel(
  status: ServiceHistoryPaymentStatus,
): string {
  return paymentStatusLabels[status];
}

export function getPaymentMethodLabel(
  method: ServiceHistoryPaymentMethod,
): string {
  return paymentMethodLabels[method];
}
