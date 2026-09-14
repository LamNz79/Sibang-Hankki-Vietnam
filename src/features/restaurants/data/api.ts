import {
  getRestaurantBySlug,
  restaurantRecords,
  type RestaurantRecord,
} from "@/features/restaurants/data/mock-data";

export type RestaurantSummary = Omit<RestaurantRecord, "slotMatrix">;

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";

export async function getRestaurants(): Promise<RestaurantSummary[]> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/restaurants`, {
      cache: "no-store",
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "development") throw error;

    console.warn("Restaurant API unavailable; using prototype data.");
    return restaurantRecords.map((restaurant) => {
      const summary = { ...restaurant };
      delete (summary as Partial<RestaurantRecord>).slotMatrix;
      return summary;
    });
  }

  if (!response.ok) throw new Error("Failed to load restaurants");

  return response.json();
}

export async function getRestaurant(slug: string): Promise<RestaurantRecord | null> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/restaurants/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "development") throw error;

    console.warn("Restaurant API unavailable; using prototype data.");
    return getRestaurantBySlug(slug) ?? null;
  }

  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Failed to load restaurant");

  return response.json();
}
