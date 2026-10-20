import { SavedRestaurantsScreen } from "@/features/restaurants/components/saved-restaurants-screen";
import { getRestaurants } from "@/features/restaurants/data/api";

export default async function SavedRestaurantsPage() {
  const restaurants = await getRestaurants();
  return <SavedRestaurantsScreen restaurants={restaurants} />;
}
