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
  restaurantName: string | null;
  statusChangedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type SystemAdminUserCreateInput = {
  userid: string;
  email: string;
  password: string;
  name: string;
  phone: string;
};

export type SystemAdminUserUpdateInput = Omit<
  SystemAdminUserCreateInput,
  "userid" | "password"
>;

export type SystemAdminRestaurant = {
  id: string;
  slug: string;
  name: string;
  citySlug: string;
  area: string | null;
  district: string | null;
  provinceCode: number | null;
  provinceName: string | null;
  approvalStatus: SystemAdminRestaurantStatus;
  createdAt: string;
  updatedAt: string;
};

export type SystemAdminRestaurantDetail = SystemAdminRestaurant & {
  description: string | null;
  cuisineType: string | null;
  cuisineLabel: string | null;
  wardCode: number | null;
  wardName: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  priceRange: string | null;
};

export type SystemAdminRestaurantAssignmentRole = "OWNER" | "STAFF";

export type SystemAdminRestaurantAssignment = {
  userId: string;
  userid: string;
  name: string;
  email: string | null;
  userStatus: SystemAdminUserStatus;
  role: SystemAdminRestaurantAssignmentRole;
  restaurantId: string;
  restaurantSlug: string;
  restaurantName: string;
  restaurantStatus: SystemAdminRestaurantStatus;
};

export type SystemAdminRestaurantAssignmentInput = {
  userId: string;
  restaurantId: string;
  role: SystemAdminRestaurantAssignmentRole;
};

export type SystemAdminRestaurantInput = {
  slug?: string;
  name: string;
  description: string;
  cuisineType: string;
  cuisineLabel: string;
  provinceCode: number | null;
  wardCode: number | null;
  address: string;
  phone: string;
  email: string;
  timezone: string;
  priceRange: string;
};

export {
  getLocationProvinces,
  getLocationWards,
  type LocationProvince,
  type LocationWard,
} from "@/features/locations/data/locations";

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
  provinceCode?: number;
};

export type SystemAdminRestaurantAssignmentParams = PageParams & {
  role?: SystemAdminRestaurantAssignmentRole;
  restaurantId?: string;
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

export function getSystemAdminUser(id: string, signal?: AbortSignal) {
  return apiFetch<SystemAdminUser>(apiEndpoints.systemAdminUser(id), {
    cache: "no-store",
    signal,
  });
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

export function getSystemAdminRestaurantAssignments(
  params: SystemAdminRestaurantAssignmentParams,
  signal?: AbortSignal,
) {
  return apiFetch<SystemAdminPage<SystemAdminRestaurantAssignment>>(
    `${apiEndpoints.systemAdminRestaurantAssignments}?${searchParams(params)}`,
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

async function writeUser<T>(
  path: string,
  method: "POST" | "PUT",
  input: SystemAdminUserCreateInput | SystemAdminUserUpdateInput,
) {
  const csrf = await getCsrfToken();
  return apiFetch<T>(path, {
    method,
    headers: { [csrf.headerName]: csrf.token },
    body: JSON.stringify(input),
  });
}

export function createSystemAdminUser(input: SystemAdminUserCreateInput) {
  return writeUser<SystemAdminUser>(apiEndpoints.systemAdminUsers, "POST", input);
}

export function updateSystemAdminUser(id: string, input: SystemAdminUserUpdateInput) {
  return writeUser<SystemAdminUser>(apiEndpoints.systemAdminUser(id), "PUT", input);
}

export async function resetSystemAdminUserPassword(id: string, newPassword: string) {
  const csrf = await getCsrfToken();
  return apiFetch<void>(apiEndpoints.systemAdminUserPassword(id), {
    method: "PATCH",
    headers: { [csrf.headerName]: csrf.token },
    body: JSON.stringify({ newPassword }),
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

async function writeRestaurantAssignment<T>(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  input?: SystemAdminRestaurantAssignmentInput,
) {
  const csrf = await getCsrfToken();
  return apiFetch<T>(path, {
    method,
    headers: { [csrf.headerName]: csrf.token },
    ...(input ? { body: JSON.stringify(input) } : {}),
  });
}

export function createSystemAdminRestaurantAssignment(
  input: SystemAdminRestaurantAssignmentInput,
) {
  return writeRestaurantAssignment<SystemAdminRestaurantAssignment>(
    apiEndpoints.systemAdminRestaurantAssignments,
    "POST",
    input,
  );
}

export function updateSystemAdminRestaurantAssignment(
  userId: string,
  input: SystemAdminRestaurantAssignmentInput,
) {
  return writeRestaurantAssignment<SystemAdminRestaurantAssignment>(
    apiEndpoints.systemAdminRestaurantAssignment(userId),
    "PUT",
    input,
  );
}

export function removeSystemAdminRestaurantAssignment(userId: string) {
  return writeRestaurantAssignment<void>(
    apiEndpoints.systemAdminRestaurantAssignment(userId),
    "DELETE",
  );
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
    "PENDING" | "ACTIVE" | "CHANGES_REQUESTED" | "SUSPENDED"
  >,
) {
  return updateStatus<SystemAdminRestaurant>(
    apiEndpoints.systemAdminRestaurantStatus(id),
    status,
  );
}
