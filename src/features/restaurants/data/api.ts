import { ApiError, apiFetch } from "@/lib/api/client";
import { withDevFallback } from "@/lib/api/dev-fallback";
import { apiEndpoints } from "@/lib/api/endpoints";
import {
  getRestaurantBySlug,
  restaurantRecords,
  type RestaurantRecord,
} from "@/features/restaurants/data/mock-data";

export type RestaurantSummary = Omit<RestaurantRecord, "slotMatrix">;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const toSummary = ({ slotMatrix, ...summary }: RestaurantRecord): RestaurantSummary =>
  summary;

export const getRestaurants = () =>
  withDevFallback(
    () =>
      apiFetch<RestaurantSummary[]>(apiEndpoints.restaurants, {
        cache: "no-store",
      }),
    () => restaurantRecords.map(toSummary),
  );

export const getRestaurant = (slug: string) =>
  withDevFallback(
    async () => {
      try {
        return await apiFetch<RestaurantRecord>(
          apiEndpoints.restaurant(slug),
          { cache: "no-store" },
        );
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
    () => getRestaurantBySlug(slug) ?? null,
  );
