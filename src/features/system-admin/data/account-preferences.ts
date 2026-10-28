import { getCsrfToken } from "@/features/auth/data/session";
import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

export type DisplayDensity = "COMFORTABLE" | "COMPACT";
export type AccountDateFormat = "DD_MM_YYYY" | "MM_DD_YYYY";
export type AccountLocale = "vi" | "en" | "ko";

export type AccountPreferences = {
  themeColor: string;
  displayDensity: DisplayDensity;
  tablePageSize: 10 | 20 | 50;
  dateFormat: AccountDateFormat;
  locale: AccountLocale;
};

export const defaultAccountPreferences: AccountPreferences = {
  themeColor: "#B84A2F",
  displayDensity: "COMFORTABLE",
  tablePageSize: 20,
  dateFormat: "DD_MM_YYYY",
  locale: "vi",
};

export function getAccountPreferences(signal?: AbortSignal) {
  return apiFetch<AccountPreferences>(apiEndpoints.accountPreferences, {
    cache: "no-store",
    signal,
  });
}

export async function updateAccountPreferences(input: AccountPreferences) {
  const csrf = await getCsrfToken();
  return apiFetch<AccountPreferences>(apiEndpoints.accountPreferences, {
    method: "PUT",
    headers: { [csrf.headerName]: csrf.token },
    body: JSON.stringify(input),
  });
}

export async function resetAccountPreferences() {
  const csrf = await getCsrfToken();
  return apiFetch<void>(apiEndpoints.accountPreferences, {
    method: "DELETE",
    headers: { [csrf.headerName]: csrf.token },
  });
}
