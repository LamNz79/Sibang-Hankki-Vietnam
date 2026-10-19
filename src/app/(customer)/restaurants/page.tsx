import { RestaurantListScreen } from "@/features/restaurants";
import { getRestaurants } from "@/features/restaurants/data/api";
import { getRestaurantLocalDate } from "@/features/restaurants/domain/live-availability";
import { getAvailability } from "@/features/reservations/data/availability";

export default async function CustomerRestaurantsPage() {
  const restaurants = await getRestaurants();
  const today = getRestaurantLocalDate();
  const availability = Object.fromEntries(
    await Promise.all(
      restaurants.map(async (restaurant) => {
        try {
          return [restaurant.slug, await getAvailability(restaurant.slug, today, 2)] as const;
        } catch {
          return [restaurant.slug, null] as const;
        }
      }),
    ),
  );

  return <RestaurantListScreen restaurants={restaurants} availability={availability} />;
}
