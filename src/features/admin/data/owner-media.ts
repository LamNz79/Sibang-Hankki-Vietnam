import { getCsrfToken } from "@/features/auth/data/session";
import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

export type RestaurantImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
};
export type RestaurantImageInput = Omit<RestaurantImage, "id">;

const mediaPaths = (restaurantId?: string) => restaurantId ? {
  collection: apiEndpoints.systemAdminRestaurantMedia(restaurantId),
  item: (id: string) => apiEndpoints.systemAdminRestaurantMediaItem(restaurantId, id),
} : {
  collection: apiEndpoints.ownerMedia,
  item: apiEndpoints.ownerMediaItem,
};

export const getOwnerMedia = (signal?: AbortSignal, restaurantId?: string) =>
  apiFetch<{ images: RestaurantImage[] }>(
    mediaPaths(restaurantId).collection,
    { cache: "no-store", signal },
  );

async function mutate<T>(path: string, method: "POST" | "PUT" | "DELETE", body?: unknown) {
  const csrf = await getCsrfToken();
  return apiFetch<T>(path, {
    method,
    headers: { [csrf.headerName]: csrf.token },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export const createRestaurantImage = (input: RestaurantImageInput, restaurantId?: string) =>
  mutate<RestaurantImage>(mediaPaths(restaurantId).collection, "POST", input);
export const updateRestaurantImage = ({ id, ...input }: RestaurantImage, restaurantId?: string) =>
  mutate<RestaurantImage>(mediaPaths(restaurantId).item(id), "PUT", input);
export const deleteRestaurantImage = (id: string, restaurantId?: string) =>
  mutate<void>(mediaPaths(restaurantId).item(id), "DELETE");
