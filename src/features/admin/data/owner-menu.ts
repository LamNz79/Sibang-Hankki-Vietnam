import { getCsrfToken } from "@/features/auth/data/session";
import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

export type MenuCategory = { id: string; name: string; displayOrder: number };
export type MenuItem = {
  id: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
  available: boolean;
};
export type OwnerMenu = { categories: MenuCategory[]; items: MenuItem[] };
export type CategoryInput = Omit<MenuCategory, "id">;
export type ItemInput = Omit<MenuItem, "id">;

export const getOwnerMenu = (signal?: AbortSignal) =>
  apiFetch<OwnerMenu>(apiEndpoints.ownerMenu, { cache: "no-store", signal });

async function mutate<T>(path: string, method: "POST" | "PUT" | "DELETE", body?: unknown) {
  const csrf = await getCsrfToken();
  return apiFetch<T>(path, {
    method,
    headers: { [csrf.headerName]: csrf.token },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export const createCategory = (input: CategoryInput) =>
  mutate<MenuCategory>(apiEndpoints.ownerMenuCategories, "POST", input);
export const updateCategory = ({ id, ...input }: MenuCategory) =>
  mutate<MenuCategory>(apiEndpoints.ownerMenuCategory(id), "PUT", input);
export const deleteCategory = (id: string) =>
  mutate<void>(apiEndpoints.ownerMenuCategory(id), "DELETE");
export const createItem = (input: ItemInput) =>
  mutate<MenuItem>(apiEndpoints.ownerMenuItems, "POST", input);
export const updateItem = ({ id, ...input }: MenuItem) =>
  mutate<MenuItem>(apiEndpoints.ownerMenuItem(id), "PUT", input);
export const deleteItem = (id: string) =>
  mutate<void>(apiEndpoints.ownerMenuItem(id), "DELETE");
