import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookingSubmissionComplete } from "@/components/booking/private-booking-status";
import {
  getDemoBookingStatusHref,
  readDemoPrivateBookingAccessToken,
} from "@/modules/booking/demo-private-booking";

export const metadata: Metadata = {
  title: "Solicitud enviada",
  description: "Tu solicitud de reserva llegó al final del flujo.",
};

type BookingSubmissionPageProps = {
  params: Promise<{ accessToken: string }>;
};

export default async function BookingSubmissionPage({
  params,
}: BookingSubmissionPageProps) {
  const { accessToken } = await params;
  const booking = readDemoPrivateBookingAccessToken(accessToken);

  if (!booking) notFound();

  const initialStatus = booking.depositMinorUnits > 0
    ? "reserved_pending_review"
    : "confirmed";

  return (
    <BookingSubmissionComplete
      booking={booking}
      statusHref={getDemoBookingStatusHref(accessToken, initialStatus)}
    />
  );
}
