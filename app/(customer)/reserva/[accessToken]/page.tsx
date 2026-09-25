import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PrivateBookingStatus } from "@/components/booking/private-booking-status";
import {
  getDemoBookingStatusHref,
  readDemoPrivateBookingAccessToken,
  resolveDemoBookingStatus,
} from "@/modules/booking/demo-private-booking";

export const metadata: Metadata = {
  title: "Estado de tu reserva",
  description: "Consulta el estado y los detalles de tu reserva en Gotchu.",
};

type BookingStatusPageProps = {
  params: Promise<{ accessToken: string }>;
  searchParams: Promise<{ estado?: string | string[] }>;
};

export default async function BookingStatusPage({
  params,
  searchParams,
}: BookingStatusPageProps) {
  const [{ accessToken }, query] = await Promise.all([params, searchParams]);
  const booking = readDemoPrivateBookingAccessToken(accessToken);

  if (!booking) notFound();

  const fallbackStatus =
    booking.depositMinorUnits > 0 ? "reserved_pending_review" : "confirmed";
  const status = resolveDemoBookingStatus(query.estado, fallbackStatus);

  return (
    <PrivateBookingStatus
      booking={booking}
      status={status}
      pendingHref={getDemoBookingStatusHref(accessToken)}
      confirmedHref={getDemoBookingStatusHref(accessToken, "confirmed")}
    />
  );
}
