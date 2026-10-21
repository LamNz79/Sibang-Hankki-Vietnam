import { ApiError, apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type {
  RestaurantRecord,
  RestaurantSummary,
} from "@/features/restaurants/data/types";

export type { RestaurantSummary } from "@/features/restaurants/data/types";

export type RestaurantListParams = {
  provinceCode?: number;
  wardCode?: number;
};

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

  return apiFetch<RestaurantSummary[]>(
    `${apiEndpoints.restaurants}${query ? `?${query}` : ""}`,
    { cache: "no-store", signal },
  );
};

export const getRestaurant = async (slug: string) => {
  try {
    return await apiFetch<RestaurantRecord>(apiEndpoints.restaurant(slug), {
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
};
