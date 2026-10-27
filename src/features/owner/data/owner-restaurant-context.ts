import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

export type OwnerRestaurantContext = {
  restaurantId: string;
  slug: string;
  name: string;
  timezone: string;
};

export function getOwnerRestaurantContext(signal?: AbortSignal) {
  return apiFetch<OwnerRestaurantContext>(apiEndpoints.ownerRestaurantContext, {
    cache: "no-store",
    signal,
  });
}
