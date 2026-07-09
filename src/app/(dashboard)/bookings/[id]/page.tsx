import { BookingDetail } from "@/features/bookings/booking-detail";

export const metadata = { title: "Booking" };

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookingDetail id={id} />;
}
