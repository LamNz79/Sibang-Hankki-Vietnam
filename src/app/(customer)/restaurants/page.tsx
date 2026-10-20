import { RestaurantListScreen } from "@/features/restaurants";
import { getRestaurants } from "@/features/restaurants/data/api";
import { getRestaurantLocalDate } from "@/features/restaurants/domain/live-availability";
import { getAvailability } from "@/features/reservations/data/availability";

function positiveInteger(value: string | string[] | undefined) {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export default async function CustomerRestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const restaurants = await getRestaurants({
    provinceCode: positiveInteger(query.provinceCode),
    wardCode: positiveInteger(query.wardCode),
  });
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
