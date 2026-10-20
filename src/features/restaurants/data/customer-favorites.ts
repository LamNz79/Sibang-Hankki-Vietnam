import { getCsrfToken } from "@/features/auth/data/session";
import type { RestaurantSummary } from "@/features/restaurants/data/api";
import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

export function getCustomerFavorites(signal?: AbortSignal) {
  return apiFetch<RestaurantSummary[]>(apiEndpoints.customerFavorites, {
    cache: "no-store",
    signal,
  });
}

async function updateCustomerFavorite(slug: string, method: "PUT" | "DELETE") {
  const csrf = await getCsrfToken();
  return apiFetch<void>(apiEndpoints.customerFavorite(slug), {
    method,
    headers: { [csrf.headerName]: csrf.token },
  });
}

export function saveCustomerFavorite(slug: string) {
  return updateCustomerFavorite(slug, "PUT");
}

export function removeCustomerFavorite(slug: string) {
  return updateCustomerFavorite(slug, "DELETE");
}
