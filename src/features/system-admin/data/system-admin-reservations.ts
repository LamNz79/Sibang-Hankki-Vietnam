import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { SystemAdminPage } from "@/features/system-admin/data/system-admin-directory";

export type SystemAdminReservationFilterStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "COMPLETED"
  | "CANCELLED"
  | "DECLINED"
  | "NO_SHOW";

export type SystemAdminReservation = {
  id: string;
  reference: string;
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  startsAt: string;
  endsAt: string;
  partySize: number;
  status: string;
  visitStatus: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SystemAdminReservationDetail = SystemAdminReservation & {
  specialRequest: string | null;
  preOrderNote: string | null;
  alternativeProposal: {
    id: string;
    startsAt: string;
    message: string | null;
    respondBy: string;
    status: string;
    createdAt: string;
  } | null;
};

export type SystemAdminReservationParams = {
  page: number;
  size: number;
  query?: string;
  restaurantId?: string;
  status?: SystemAdminReservationFilterStatus;
  dateFrom?: string;
  dateTo?: string;
};

export function getSystemAdminReservations(
  params: SystemAdminReservationParams,
  signal?: AbortSignal,
) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  return apiFetch<SystemAdminPage<SystemAdminReservation>>(
    `${apiEndpoints.systemAdminReservations}?${search}`,
    { cache: "no-store", signal },
  );
}

export function getSystemAdminReservation(id: string, signal?: AbortSignal) {
  return apiFetch<SystemAdminReservationDetail>(
    apiEndpoints.systemAdminReservation(id),
    { cache: "no-store", signal },
  );
}

export function getSystemAdminReservationDisplayStatus(
  reservation: Pick<SystemAdminReservation, "status" | "visitStatus">,
): SystemAdminReservationFilterStatus {
  if (reservation.visitStatus === "NO_SHOW") return "NO_SHOW";
  if (reservation.visitStatus === "COMPLETED") return "COMPLETED";
  if (["ARRIVED", "SEATED"].includes(reservation.visitStatus ?? "")) {
    return "CHECKED_IN";
  }
  if (["PENDING", "ALTERNATIVE_PROPOSED"].includes(reservation.status)) {
    return "PENDING";
  }
  if (["DECLINED", "EXPIRED"].includes(reservation.status)) return "DECLINED";
  return reservation.status as SystemAdminReservationFilterStatus;
}
