import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

export type SystemAdminUserRole = "CUSTOMER" | "OWNER" | "STAFF" | "ADMIN";
export type SystemAdminUserStatus = "ACTIVE" | "SUSPENDED" | "CLOSED";
export type SystemAdminRestaurantStatus =
  | "DRAFT"
  | "PENDING"
  | "CHANGES_REQUESTED"
  | "ACTIVE"
  | "SUSPENDED";

export type SystemAdminUser = {
  id: string;
  userid: string;
  email: string | null;
  name: string;
  phone: string | null;
  role: SystemAdminUserRole;
  status: SystemAdminUserStatus;
  restaurantId: string | null;
  statusChangedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type SystemAdminRestaurant = {
  id: string;
  slug: string;
  name: string;
  citySlug: string;
  area: string | null;
  district: string | null;
  approvalStatus: SystemAdminRestaurantStatus;
  createdAt: string;
  updatedAt: string;
};

export type SystemAdminPage<T> = {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

type PageParams = {
  page: number;
  size: number;
  query?: string;
};

export type SystemAdminUserParams = PageParams & {
  role?: SystemAdminUserRole;
  status?: SystemAdminUserStatus;
};

export type SystemAdminRestaurantParams = PageParams & {
  status?: SystemAdminRestaurantStatus;
  citySlug?: string;
};

function searchParams(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  return search;
}

export function getSystemAdminUsers(
  params: SystemAdminUserParams,
  signal?: AbortSignal,
) {
  return apiFetch<SystemAdminPage<SystemAdminUser>>(
    `${apiEndpoints.systemAdminUsers}?${searchParams(params)}`,
    { cache: "no-store", signal },
  );
}

export function getSystemAdminRestaurants(
  params: SystemAdminRestaurantParams,
  signal?: AbortSignal,
) {
  return apiFetch<SystemAdminPage<SystemAdminRestaurant>>(
    `${apiEndpoints.systemAdminRestaurants}?${searchParams(params)}`,
    { cache: "no-store", signal },
  );
}
