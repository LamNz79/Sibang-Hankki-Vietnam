import { ReservationBookingScreen } from "@/features/reservations";
import { getRestaurant } from "@/features/restaurants/data/api";
import { notFound } from "next/navigation";

export default async function CustomerReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ restaurant?: string; change?: string }>;
}) {
  const { restaurant: slug = "royal-pavilion", change } = await searchParams;
  const restaurant = await getRestaurant(slug);

  if (!restaurant) notFound();

  return (
    <ReservationBookingScreen
      restaurant={restaurant}
      changeReservationId={change}
    />
  );
}
