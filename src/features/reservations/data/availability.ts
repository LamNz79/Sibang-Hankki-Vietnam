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
  const response = await fetch(
    `/api/restaurants/${encodeURIComponent(slug)}/availability?${search}`,
    { signal, cache: "no-store" },
  );
  if (!response.ok) throw new Error("Unable to load available times. Please try again.");
  return response.json();
}
