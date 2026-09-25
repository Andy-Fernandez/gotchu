export type ServiceHistoryBookingStatus =
  "reserved_pending_review" | "confirmed" | "completed";

export type ServiceHistoryExecutionStatus = "not_started" | "completed";

export type ServiceHistoryPaymentStatus =
  "pending_review" | "approved" | "paid";

export type ServiceHistorySource =
  "online" | "whatsapp" | "phone" | "in_person" | "walk_in";

export type ServiceHistoryPaymentMethod =
  "shop_qr" | "cash" | "complimentary" | "other";

export type ServiceHistoryItem = {
  id: string;
  name: string;
  durationMinutes: number;
  priceMinorUnits: number;
};

export type ServiceHistoryRecord = {
  id: string;
  shopId: string;
  bookingCode: string;
  customerName: string;
  customerWhatsapp: string;
  assignedBarberName: string;
  source: ServiceHistorySource;
  bookingStatus: ServiceHistoryBookingStatus;
  executionStatus: ServiceHistoryExecutionStatus;
  paymentStatus: ServiceHistoryPaymentStatus;
  paymentMethod?: ServiceHistoryPaymentMethod;
  items: ServiceHistoryItem[];
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  receiptSubmittedAt?: string;
  confirmedAt?: string;
  completedAt?: string;
  completedByName?: string;
  totalMinorUnits: number;
  depositAppliedMinorUnits: number;
  remainingBalanceMinorUnits: number;
  finalAmountMinorUnits?: number;
  note?: string;
};

export const serviceHistoryFilterValues = [
  "todos",
  "pendientes",
  "confirmados",
  "realizados",
] as const;

export type ServiceHistoryFilter = (typeof serviceHistoryFilterValues)[number];

export type ServiceHistoryCounts = Record<ServiceHistoryFilter, number>;
