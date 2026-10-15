import { getCsrfToken } from "@/features/auth/data/session";
import type {
  BusinessHour,
  BusinessHoursUpdate,
  SlotRegeneration,
} from "@/features/owner/settings/data/business-hours";
import type { ConfirmationMode } from "@/features/owner/settings/data/owner-settings";
import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

export type SystemAdminBookingSettings = {
  confirmationMode: ConfirmationMode;
  manualConfirmationMinPartySize: number | null;
  guestCapacity: number;
  slotIntervalMinutes: number;
  diningDurationMinutes: number;
  bookingWindowDays: number;
  minimumPartySize: number;
  maximumOnlinePartySize: number;
  largePartyThreshold: number;
  cancellationCutoffMinutes: number | null;
  noShowGraceMinutes: number | null;
};

async function write<T>(path: string, method: "PUT" | "POST", body?: unknown) {
  const csrf = await getCsrfToken();
  return apiFetch<T>(path, {
    method,
    headers: { [csrf.headerName]: csrf.token },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function getSystemAdminBookingSettings(id: string, signal?: AbortSignal) {
  return apiFetch<SystemAdminBookingSettings>(
    apiEndpoints.systemAdminRestaurantBookingSettings(id),
    { cache: "no-store", signal },
  );
}

export function updateSystemAdminBookingSettings(
  id: string,
  settings: SystemAdminBookingSettings,
) {
  return write<SystemAdminBookingSettings>(
    apiEndpoints.systemAdminRestaurantBookingSettings(id),
    "PUT",
    settings,
  );
}

export function getSystemAdminBusinessHours(id: string, signal?: AbortSignal) {
  return apiFetch<BusinessHour[]>(
    apiEndpoints.systemAdminRestaurantBusinessHours(id),
    { cache: "no-store", signal },
  );
}

export function updateSystemAdminBusinessHours(id: string, hours: BusinessHour[]) {
  return write<BusinessHoursUpdate>(
    apiEndpoints.systemAdminRestaurantBusinessHours(id),
    "PUT",
    { hours },
  );
}

export function regenerateSystemAdminRestaurantSlots(id: string) {
  return write<SlotRegeneration>(
    apiEndpoints.regenerateSystemAdminRestaurantSlots(id),
    "POST",
  );
}
