import type { RestaurantSummary } from "@/features/restaurants/data/types";
import { isGeoPoint } from "@/features/restaurants/domain/location";

export function filterMappableRestaurants(
  restaurants: RestaurantSummary[],
  query: string,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return restaurants.filter((restaurant) => {
    if (!isGeoPoint(restaurant)) return false;
    if (!normalizedQuery) return true;
    return `${restaurant.name} ${restaurant.area} ${restaurant.cuisineLabel}`
      .toLocaleLowerCase()
      .includes(normalizedQuery);
  });
}
