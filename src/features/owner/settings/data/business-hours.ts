import { getCsrfToken } from "@/features/auth/data/session";
import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

export type BusinessHour = {
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
};

export type SlotRegeneration = {
  deletedSlots: number;
  generatedSlots: number;
};

export type BusinessHoursUpdate = SlotRegeneration & {
  hours: BusinessHour[];
};

export function getBusinessHours(signal?: AbortSignal) {
  return apiFetch<BusinessHour[]>(apiEndpoints.ownerBusinessHours, {
    cache: "no-store",
    signal,
  });
}

async function csrfRequest<T>(path: string, method: "PUT" | "POST", body?: unknown) {
  const csrf = await getCsrfToken();
  return apiFetch<T>(path, {
    method,
    headers: { [csrf.headerName]: csrf.token },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export const updateBusinessHours = (hours: BusinessHour[]) =>
  csrfRequest<BusinessHoursUpdate>(apiEndpoints.ownerBusinessHours, "PUT", { hours });

export const regenerateSlots = () =>
  csrfRequest<SlotRegeneration>(apiEndpoints.regenerateOwnerSlots, "POST");
