import { notFound } from "next/navigation";

import { PublicBookingPage } from "@/components/booking/public-booking-page";
import { getPublicBookingPageState } from "@/modules/scheduling/public-booking-page-state";

type BookingPageProps = {
  params: Promise<{ shopSlug: string }>;
  searchParams: Promise<{
    service?: string | string[];
    barber?: string | string[];
    date?: string | string[];
    slot?: string | string[];
    step?: string | string[];
  }>;
};

export default async function BookingPage({
  params,
  searchParams,
}: BookingPageProps) {
  const [{ shopSlug }, query] = await Promise.all([params, searchParams]);
  const state = await getPublicBookingPageState({
    shopSlug,
    service: query.service,
    barber: query.barber,
    date: query.date,
    slot: query.slot,
    step: query.step,
  });

  if (!state) notFound();

  return <PublicBookingPage state={state} />;
}
