import { RestaurantListScreen } from "@/features/restaurants";
import { getRestaurants } from "@/features/restaurants/data/api";

export default async function CustomerRestaurantsPage() {
  const restaurants = await getRestaurants();

  return <RestaurantListScreen restaurants={restaurants} />;
}
