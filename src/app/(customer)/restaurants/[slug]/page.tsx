import { RestaurantDetailsScreen } from "@/features/restaurants";

export default async function CustomerRestaurantDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <RestaurantDetailsScreen slug={slug} />;
}
