import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

export type RestaurantAvailability = {
  restaurantSlug: string;
  date: string;
  partySize: number;
  slots: string[];
  requiresRestaurantConfirmation: boolean;
};

export async function getAvailability(
  slug: string,
  date: string,
  partySize: number,
  signal?: AbortSignal,
): Promise<RestaurantAvailability> {
  const search = new URLSearchParams({ date, partySize: String(partySize) });
  return apiFetch<RestaurantAvailability>(`${apiEndpoints.availability(slug)}?${search}`, {
    signal,
    cache: "no-store",
  });
}
