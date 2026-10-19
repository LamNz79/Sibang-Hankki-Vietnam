import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import type { CustomerReservation } from "@/features/reservations/types";
import { ReservationStatus, VisitStatus } from "@/features/reservations/types";
import { getCsrfToken } from "@/features/auth/data/session";
import {
  getRestaurants,
  type RestaurantSummary,
} from "@/features/restaurants/data/api";
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
  visitStatus?: keyof typeof visitStatuses | null;
  specialRequest?: string | null;
  preOrderNote?: string | null;
  createdAt: string;
  updatedAt: string;
  restaurantSlug?: string;
  restaurantName?: string;
  alternativeProposal?: {
    id: string;
    startsAt: string;
    message?: string | null;
    respondBy?: string | null;
    status: "PENDING" | "ACCEPTED" | "DECLINED";
    initiator?: "RESTAURANT" | "CUSTOMER";
    createdAt: string;
  } | null;
};

const reservationStatuses = {
  PENDING: ReservationStatus.Pending,
  ALTERNATIVE_PROPOSED: ReservationStatus.AlternativeProposed,
  CONFIRMED: ReservationStatus.Confirmed,
  DECLINED: ReservationStatus.Declined,
  EXPIRED: ReservationStatus.Expired,
  CANCELLED: ReservationStatus.Cancelled,
};

const visitStatuses = {
  EXPECTED: VisitStatus.Expected,
  ARRIVED: VisitStatus.Arrived,
  SEATED: VisitStatus.Seated,
  COMPLETED: VisitStatus.Completed,
  NO_SHOW: VisitStatus.NoShow,
};

export function mergeCustomerReservation(
  stored: CustomerReservation,
  record: CustomerReservationRecord,
): CustomerReservation {
  // ponytail: the customer API does not expose restaurant timezone yet.
  const startsAt = dayjs(record.startsAt).tz("Asia/Ho_Chi_Minh");
  const proposalStartsAt = record.alternativeProposal
    ? dayjs(record.alternativeProposal.startsAt).tz("Asia/Ho_Chi_Minh")
    : null;
  return {
    ...stored,
    id: record.id,
    reference: record.reference,
    date: startsAt.format("YYYY-MM-DD"),
    time: startsAt.format("HH:mm"),
    guests: record.partySize,
    status: reservationStatuses[record.status],
    visitStatus: record.visitStatus
      ? visitStatuses[record.visitStatus]
      : undefined,
    specialRequest: record.specialRequest ?? undefined,
    preOrder: record.preOrderNote ?? undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    alternativeProposal:
      record.status === "ALTERNATIVE_PROPOSED" &&
      record.alternativeProposal?.status === "PENDING" &&
      record.alternativeProposal.initiator !== "CUSTOMER" &&
      proposalStartsAt
        ? {
            id: record.alternativeProposal.id,
            date: proposalStartsAt.format("YYYY-MM-DD"),
            time: proposalStartsAt.format("HH:mm"),
            message: record.alternativeProposal.message ?? undefined,
            respondBy: record.alternativeProposal.respondBy ?? undefined,
            proposedAt: record.alternativeProposal.createdAt,
          }
        : undefined,
    changeRequest:
      record.alternativeProposal?.initiator === "CUSTOMER" &&
      (record.alternativeProposal.status === "PENDING" ||
        record.alternativeProposal.status === "DECLINED") &&
      proposalStartsAt
        ? {
            id: record.alternativeProposal.id,
            date: proposalStartsAt.format("YYYY-MM-DD"),
            time: proposalStartsAt.format("HH:mm"),
            message: record.alternativeProposal.message ?? undefined,
            status: record.alternativeProposal.status,
          }
        : undefined,
  };
}

export function mapAccountReservation(
  record: CustomerReservationRecord,
  restaurant?: RestaurantSummary,
): CustomerReservation {
  return mergeCustomerReservation(
    {
      id: record.id,
      reference: record.reference,
      restaurantSlug: record.restaurantSlug ?? "",
      restaurantName: record.restaurantName ?? restaurant?.name ?? "Restaurant",
      district: restaurant?.district ?? "",
      cuisineLabel: restaurant?.cuisineLabel ?? "",
      restaurantImageUrl: restaurant?.imageUrl || undefined,
      restaurantImageAlt: restaurant?.imageAlt || undefined,
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
    let restaurants: RestaurantSummary[] = [];
    try {
      restaurants = await getRestaurants(signal);
    } catch (error) {
      if (signal?.aborted) throw error;
    }
    const restaurantsBySlug = new Map(
      restaurants.map((restaurant) => [restaurant.slug, restaurant]),
    );
    return records.map((record) =>
      mapAccountReservation(
        record,
        restaurantsBySlug.get(record.restaurantSlug ?? ""),
      ),
    );
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
    return local
      ? {
          ...local,
          ...reservation,
          restaurantName: reservation.restaurantName || local.restaurantName,
          district: reservation.district || local.district,
          cuisineLabel: reservation.cuisineLabel || local.cuisineLabel,
          restaurantImageUrl:
            reservation.restaurantImageUrl || local.restaurantImageUrl,
          restaurantImageAlt:
            reservation.restaurantImageAlt || local.restaurantImageAlt,
        }
      : reservation;
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

export async function getCustomerAccountReservation(
  reservation: CustomerReservation,
  signal?: AbortSignal,
) {
  const record = await apiFetch<CustomerReservationRecord>(
    apiEndpoints.customerAccountReservation(reservation.id),
    { cache: "no-store", signal },
  );
  return mergeCustomerReservation(reservation, record);
}

export async function respondToAlternativeProposal(
  reservation: CustomerReservation,
  action: "accept" | "decline",
) {
  const proposalId = reservation.alternativeProposal?.id;
  if (!proposalId) throw new Error("Reservation proposal is unavailable");

  if (reservation.accountLinked) {
    const csrf = await getCsrfToken();
    const record = await apiFetch<CustomerReservationRecord>(
      apiEndpoints.respondToCustomerAccountReservationProposal(
        reservation.id,
        proposalId,
        action,
      ),
      {
        method: "POST",
        headers: { [csrf.headerName]: csrf.token },
      },
    );
    return mergeCustomerReservation(reservation, record);
  }

  if (!reservation.managementToken) {
    throw new Error("Reservation management token is unavailable");
  }
  const record = await apiFetch<CustomerReservationRecord>(
    apiEndpoints.respondToCustomerReservationProposal(
      reservation.id,
      proposalId,
      action,
    ),
    {
      method: "POST",
      headers: {
        "X-Reservation-Management-Token": reservation.managementToken,
      },
    },
  );
  return mergeCustomerReservation(reservation, record);
}

export async function requestAnotherTime(
  reservation: CustomerReservation,
  requestedDate: string,
  requestedTime: string,
) {
  const proposalId = reservation.alternativeProposal?.id;
  if (!proposalId) throw new Error("Reservation proposal is unavailable");

  const body = JSON.stringify({ requestedDate, requestedTime });
  if (reservation.accountLinked) {
    const csrf = await getCsrfToken();
    const record = await apiFetch<CustomerReservationRecord>(
      apiEndpoints.requestAnotherTimeForCustomerAccountReservation(
        reservation.id,
        proposalId,
      ),
      {
        method: "POST",
        headers: { [csrf.headerName]: csrf.token },
        body,
      },
    );
    return mergeCustomerReservation(reservation, record);
  }

  if (!reservation.managementToken) {
    throw new Error("Reservation management token is unavailable");
  }
  const record = await apiFetch<CustomerReservationRecord>(
    apiEndpoints.requestAnotherTimeForCustomerReservation(
      reservation.id,
      proposalId,
    ),
    {
      method: "POST",
      headers: {
        "X-Reservation-Management-Token": reservation.managementToken,
      },
      body,
    },
  );
  return mergeCustomerReservation(reservation, record);
}

export async function requestReservationChange(
  reservation: CustomerReservation,
  requestedDate: string,
  requestedTime: string,
  message?: string,
) {
  const body = JSON.stringify({ requestedDate, requestedTime, message });
  if (reservation.accountLinked) {
    const csrf = await getCsrfToken();
    const record = await apiFetch<CustomerReservationRecord>(
      apiEndpoints.requestCustomerAccountReservationChange(reservation.id),
      {
        method: "POST",
        headers: { [csrf.headerName]: csrf.token },
        body,
      },
    );
    return mergeCustomerReservation(reservation, record);
  }

  if (!reservation.managementToken) {
    throw new Error("Reservation management token is unavailable");
  }
  const record = await apiFetch<CustomerReservationRecord>(
    apiEndpoints.requestCustomerReservationChange(reservation.id),
    {
      method: "POST",
      headers: {
        "X-Reservation-Management-Token": reservation.managementToken,
      },
      body,
    },
  );
  return mergeCustomerReservation(reservation, record);
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

type CheckInTokenResponse = {
  reservationId: string;
  checkInToken: string;
};

export async function issueCustomerCheckInToken(
  reservation: CustomerReservation,
) {
  if (reservation.accountLinked) {
    const csrf = await getCsrfToken();
    const response = await apiFetch<CheckInTokenResponse>(
      apiEndpoints.customerAccountReservationCheckInToken(reservation.id),
      {
        method: "POST",
        headers: { [csrf.headerName]: csrf.token },
      },
    );
    return response.checkInToken;
  }

  if (!reservation.managementToken) {
    throw new Error("Reservation management token is unavailable");
  }
  const response = await apiFetch<CheckInTokenResponse>(
    apiEndpoints.customerReservationCheckInToken(reservation.id),
    {
      method: "POST",
      headers: {
        "X-Reservation-Management-Token": reservation.managementToken,
      },
    },
  );
  return response.checkInToken;
}
