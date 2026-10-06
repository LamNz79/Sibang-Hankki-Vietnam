import { getCsrfToken } from "@/features/auth/data/session";
import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

export type ConfirmationMode = "AUTO" | "MANUAL" | "HYBRID";

export type OwnerSettings = {
  restaurantId: string;
  slug: string;
  name: string;
  description: string | null;
  cuisineLabel: string | null;
  citySlug: string;
  area: string | null;
  district: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  priceRange: string | null;
  guestCapacity: number;
  bookingIntervalMinutes: number;
  diningDurationMinutes: number;
  confirmationMode: ConfirmationMode;
  manualConfirmationMinPartySize: number | null;
  bookingWindowDays: number;
  minimumPartySize: number;
  maximumOnlinePartySize: number;
  largePartyThreshold: number;
  customerCancellationCutoffMinutes: number | null;
};

export type OwnerSettingsUpdate = Omit<
  OwnerSettings,
  "restaurantId" | "slug" | "citySlug" | "timezone"
>;

export function getOwnerSettings(signal?: AbortSignal) {
  return apiFetch<OwnerSettings>(apiEndpoints.ownerSettings, {
    cache: "no-store",
    signal,
  });
}

export async function updateOwnerSettings(settings: OwnerSettingsUpdate) {
  const csrf = await getCsrfToken();
  return apiFetch<OwnerSettings>(apiEndpoints.ownerSettings, {
    method: "PUT",
    headers: { [csrf.headerName]: csrf.token },
    body: JSON.stringify(settings),
  });
}
