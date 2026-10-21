import { ReservationBookingScreen } from "@/features/reservations";
import { getRestaurant } from "@/features/restaurants/data/api";
import { notFound, redirect } from "next/navigation";

export default async function CustomerReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ restaurant?: string; change?: string }>;
}) {
  const { restaurant: slug, change } = await searchParams;
  if (!slug) redirect("/restaurants");
  const restaurant = await getRestaurant(slug);

  if (!restaurant) notFound();

  return (
    <ReservationBookingScreen
      restaurant={restaurant}
      changeReservationId={change}
    />
  );
}
