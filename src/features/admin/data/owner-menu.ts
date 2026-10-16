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

const menuPaths = (restaurantId?: string) => restaurantId ? {
  menu: apiEndpoints.systemAdminRestaurantMenu(restaurantId),
  categories: apiEndpoints.systemAdminRestaurantMenuCategories(restaurantId),
  category: (id: string) => apiEndpoints.systemAdminRestaurantMenuCategory(restaurantId, id),
  items: apiEndpoints.systemAdminRestaurantMenuItems(restaurantId),
  item: (id: string) => apiEndpoints.systemAdminRestaurantMenuItem(restaurantId, id),
} : {
  menu: apiEndpoints.ownerMenu,
  categories: apiEndpoints.ownerMenuCategories,
  category: apiEndpoints.ownerMenuCategory,
  items: apiEndpoints.ownerMenuItems,
  item: apiEndpoints.ownerMenuItem,
};

export const getOwnerMenu = (signal?: AbortSignal, restaurantId?: string) =>
  apiFetch<OwnerMenu>(menuPaths(restaurantId).menu, { cache: "no-store", signal });

async function mutate<T>(path: string, method: "POST" | "PUT" | "DELETE", body?: unknown) {
  const csrf = await getCsrfToken();
  return apiFetch<T>(path, {
    method,
    headers: { [csrf.headerName]: csrf.token },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export const createCategory = (input: CategoryInput, restaurantId?: string) =>
  mutate<MenuCategory>(menuPaths(restaurantId).categories, "POST", input);
export const updateCategory = ({ id, ...input }: MenuCategory, restaurantId?: string) =>
  mutate<MenuCategory>(menuPaths(restaurantId).category(id), "PUT", input);
export const deleteCategory = (id: string, restaurantId?: string) =>
  mutate<void>(menuPaths(restaurantId).category(id), "DELETE");
export const createItem = (input: ItemInput, restaurantId?: string) =>
  mutate<MenuItem>(menuPaths(restaurantId).items, "POST", input);
export const updateItem = ({ id, ...input }: MenuItem, restaurantId?: string) =>
  mutate<MenuItem>(menuPaths(restaurantId).item(id), "PUT", input);
export const deleteItem = (id: string, restaurantId?: string) =>
  mutate<void>(menuPaths(restaurantId).item(id), "DELETE");
