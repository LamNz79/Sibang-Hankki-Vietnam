import { RestaurantDetailsScreen } from "@/features/restaurants";
import { getRestaurant } from "@/features/restaurants/data/api";
import { getRestaurantLocalDate } from "@/features/restaurants/domain/live-availability";
import { getAvailability } from "@/features/reservations/data/availability";
import { notFound } from "next/navigation";

export default async function CustomerRestaurantDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);

  if (!restaurant) notFound();
  const availability = await getAvailability(
    slug,
    getRestaurantLocalDate(),
    2,
  ).catch(() => null);

  return <RestaurantDetailsScreen restaurant={restaurant} availability={availability} />;
}
