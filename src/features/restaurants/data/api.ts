import { ApiError, apiFetch } from "@/lib/api/client";
import { withDevFallback } from "@/lib/api/dev-fallback";
import { apiEndpoints } from "@/lib/api/endpoints";
import {
  getRestaurantBySlug,
  restaurantRecords,
  type RestaurantRecord,
} from "@/features/restaurants/data/mock-data";

export type RestaurantSummary = Omit<RestaurantRecord, "slotMatrix" | "menuCategories">;

export type RestaurantListParams = {
  provinceCode?: number;
  wardCode?: number;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const toSummary = ({ slotMatrix, menuCategories, ...summary }: RestaurantRecord): RestaurantSummary =>
  summary;

export const getRestaurants = (
  params: RestaurantListParams = {},
  signal?: AbortSignal,
) => {
  const search = new URLSearchParams();
  if (params.provinceCode !== undefined) {
    search.set("provinceCode", String(params.provinceCode));
  }
  if (params.wardCode !== undefined) {
    search.set("wardCode", String(params.wardCode));
  }
  const query = search.toString();

  return withDevFallback(
    () =>
      apiFetch<RestaurantSummary[]>(`${apiEndpoints.restaurants}${query ? `?${query}` : ""}`, {
        cache: "no-store",
        signal,
      }),
    () => restaurantRecords.map(toSummary),
  );
};

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
