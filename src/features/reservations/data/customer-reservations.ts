import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import type { CustomerReservation } from "@/features/reservations/types";
import { ReservationStatus } from "@/features/reservations/types";
import { getCsrfToken } from "@/features/auth/data/session";
import { getRestaurantBySlug } from "@/features/restaurants/data/mock-data";
import { ApiError, apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

dayjs.extend(utc);
dayjs.extend(timezone);

type CustomerReservationRecord = {
  id: string;
  reference: string;
  startsAt: string;
  partySize: number;
  status: keyof typeof reservationStatuses;
  specialRequest?: string | null;
  preOrderNote?: string | null;
  createdAt: string;
  updatedAt: string;
  restaurantSlug?: string;
  restaurantName?: string;
};

const reservationStatuses = {
  PENDING: ReservationStatus.Pending,
  ALTERNATIVE_PROPOSED: ReservationStatus.AlternativeProposed,
  CONFIRMED: ReservationStatus.Confirmed,
  DECLINED: ReservationStatus.Declined,
  EXPIRED: ReservationStatus.Expired,
  CANCELLED: ReservationStatus.Cancelled,
};

export function mergeCustomerReservation(
  stored: CustomerReservation,
  record: CustomerReservationRecord,
): CustomerReservation {
  // ponytail: the customer API does not expose restaurant timezone yet.
  const startsAt = dayjs(record.startsAt).tz("Asia/Ho_Chi_Minh");
  return {
    ...stored,
    id: record.id,
    reference: record.reference,
    date: startsAt.format("YYYY-MM-DD"),
    time: startsAt.format("HH:mm"),
    guests: record.partySize,
    status: reservationStatuses[record.status],
    specialRequest: record.specialRequest ?? undefined,
    preOrder: record.preOrderNote ?? undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function mapAccountReservation(
  record: CustomerReservationRecord,
): CustomerReservation {
  const restaurant = getRestaurantBySlug(record.restaurantSlug ?? "");
  return mergeCustomerReservation(
    {
      id: record.id,
      reference: record.reference,
      restaurantSlug: record.restaurantSlug ?? "",
      restaurantName: record.restaurantName ?? restaurant?.name ?? "Restaurant",
      district: restaurant?.district ?? "",
      cuisineLabel: restaurant?.cuisineLabel ?? "",
      date: "",
      time: "",
      guests: record.partySize,
      status: reservationStatuses[record.status],
      accountLinked: true,
      createdAt: record.createdAt,
    },
    record,
  );
}

export async function getAccountReservations(signal?: AbortSignal) {
  try {
    const records = await apiFetch<CustomerReservationRecord[]>(
      apiEndpoints.customerAccountReservations,
      { cache: "no-store", signal },
    );
    return records.map(mapAccountReservation);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return null;
    }
    throw error;
  }
}

export function selectVisibleReservations(
  stored: CustomerReservation[],
  account: CustomerReservation[] | null | undefined,
) {
  if (account === null) {
    return stored.filter((reservation) => reservation.managementToken);
  }
  if (!account) return [];

  return account.map((reservation) => {
    const local = stored.find(({ id }) => id === reservation.id);
    return local ? { ...local, ...reservation } : reservation;
  });
}

export async function getCustomerReservation(
  stored: CustomerReservation,
  signal?: AbortSignal,
) {
  if (!stored.managementToken) return stored;

  const record = await apiFetch<CustomerReservationRecord>(
    apiEndpoints.customerReservation(stored.id),
    {
      cache: "no-store",
      signal,
      headers: { "X-Reservation-Management-Token": stored.managementToken },
    },
  );
  return mergeCustomerReservation(stored, record);
}

export async function cancelCustomerReservation(stored: CustomerReservation) {
  if (stored.accountLinked) {
    const csrf = await getCsrfToken();
    const record = await apiFetch<CustomerReservationRecord>(
      apiEndpoints.cancelCustomerAccountReservation(stored.id),
      {
        method: "POST",
        headers: { [csrf.headerName]: csrf.token },
      },
    );
    return mergeCustomerReservation(stored, record);
  }

  if (!stored.managementToken) {
    throw new Error("Reservation management token is unavailable");
  }

  const record = await apiFetch<CustomerReservationRecord>(
    apiEndpoints.cancelCustomerReservation(stored.id),
    {
      method: "POST",
      headers: {
        "X-Reservation-Management-Token": stored.managementToken,
      },
    },
  );
  return mergeCustomerReservation(stored, record);
}
