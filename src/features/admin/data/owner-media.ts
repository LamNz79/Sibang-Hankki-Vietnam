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

export const getOwnerMedia = (signal?: AbortSignal) =>
  apiFetch<{ images: RestaurantImage[] }>(apiEndpoints.ownerMedia, { cache: "no-store", signal });

async function mutate<T>(path: string, method: "POST" | "PUT" | "DELETE", body?: unknown) {
  const csrf = await getCsrfToken();
  return apiFetch<T>(path, {
    method,
    headers: { [csrf.headerName]: csrf.token },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export const createRestaurantImage = (input: RestaurantImageInput) =>
  mutate<RestaurantImage>(apiEndpoints.ownerMedia, "POST", input);
export const updateRestaurantImage = ({ id, ...input }: RestaurantImage) =>
  mutate<RestaurantImage>(apiEndpoints.ownerMediaItem(id), "PUT", input);
export const deleteRestaurantImage = (id: string) =>
  mutate<void>(apiEndpoints.ownerMediaItem(id), "DELETE");
