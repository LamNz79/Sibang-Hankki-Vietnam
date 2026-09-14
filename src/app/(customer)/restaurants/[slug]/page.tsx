import { RestaurantDetailsScreen } from "@/features/restaurants";
import { getRestaurant } from "@/features/restaurants/data/api";
import { notFound } from "next/navigation";

export default async function CustomerRestaurantDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);

  if (!restaurant) notFound();

  return <RestaurantDetailsScreen restaurant={restaurant} />;
}
