import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { getCsrfToken } from "@/features/auth/data/session";

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

export type SystemAdminRestaurantDetail = SystemAdminRestaurant & {
  description: string | null;
  cuisineType: string | null;
  cuisineLabel: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  priceRange: string | null;
};

export type SystemAdminRestaurantInput = {
  slug?: string;
  name: string;
  description: string;
  cuisineType: string;
  cuisineLabel: string;
  citySlug: string;
  area: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  timezone: string;
  priceRange: string;
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

export function getSystemAdminRestaurant(id: string, signal?: AbortSignal) {
  return apiFetch<SystemAdminRestaurantDetail>(
    apiEndpoints.systemAdminRestaurant(id),
    { cache: "no-store", signal },
  );
}

async function writeRestaurant<T>(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  input?: SystemAdminRestaurantInput,
) {
  const csrf = await getCsrfToken();
  return apiFetch<T>(path, {
    method,
    headers: { [csrf.headerName]: csrf.token },
    ...(input ? { body: JSON.stringify(input) } : {}),
  });
}

export function createSystemAdminRestaurant(input: SystemAdminRestaurantInput) {
  return writeRestaurant<SystemAdminRestaurantDetail>(
    apiEndpoints.systemAdminRestaurants,
    "POST",
    input,
  );
}

export function updateSystemAdminRestaurant(
  id: string,
  input: SystemAdminRestaurantInput,
) {
  return writeRestaurant<SystemAdminRestaurantDetail>(
    apiEndpoints.systemAdminRestaurant(id),
    "PUT",
    input,
  );
}

export function archiveSystemAdminRestaurant(id: string) {
  return writeRestaurant<void>(apiEndpoints.systemAdminRestaurant(id), "DELETE");
}

async function updateStatus<T>(path: string, status: string) {
  const csrf = await getCsrfToken();
  return apiFetch<T>(path, {
    method: "PATCH",
    headers: { [csrf.headerName]: csrf.token },
    body: JSON.stringify({ status }),
  });
}

export function updateSystemAdminUserStatus(
  id: string,
  status: Extract<SystemAdminUserStatus, "ACTIVE" | "SUSPENDED">,
) {
  return updateStatus<SystemAdminUser>(
    apiEndpoints.systemAdminUserStatus(id),
    status,
  );
}

export function updateSystemAdminRestaurantStatus(
  id: string,
  status: Extract<
    SystemAdminRestaurantStatus,
    "ACTIVE" | "CHANGES_REQUESTED" | "SUSPENDED"
  >,
) {
  return updateStatus<SystemAdminRestaurant>(
    apiEndpoints.systemAdminRestaurantStatus(id),
    status,
  );
}
