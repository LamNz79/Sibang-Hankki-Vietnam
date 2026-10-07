import { getCsrfToken } from "@/features/auth/data/session";
import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

export type CustomerProfile = {
  id: string;
  userid: string;
  name: string;
  email: string;
  phone: string | null;
};

export type CustomerProfileUpdate = Pick<CustomerProfile, "name" | "email" | "phone">;

export function getCustomerProfile(signal?: AbortSignal) {
  return apiFetch<CustomerProfile>(apiEndpoints.customerProfile, {
    cache: "no-store",
    signal,
  });
}

export async function updateCustomerProfile(profile: CustomerProfileUpdate) {
  const csrf = await getCsrfToken();
  return apiFetch<CustomerProfile>(apiEndpoints.customerProfile, {
    method: "PUT",
    headers: { [csrf.headerName]: csrf.token },
    body: JSON.stringify(profile),
  });
}
