import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { getCsrfToken } from "@/features/auth/data/session";
import type { OwnerReservation } from "@/features/owner/types";
import {
  ReservationStatus,
  VisitStatus,
} from "@/features/reservations/types";
import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

dayjs.extend(utc);
dayjs.extend(timezone);

type OwnerReservationRecord = {
  id: string;
  reference: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  startsAt: string;
  endsAt: string;
  partySize: number;
  status: keyof typeof reservationStatuses;
  visitStatus: keyof typeof visitStatuses | null;
  specialRequest?: string | null;
  preOrderNote?: string | null;
  createdAt: string;
  updatedAt: string;
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

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => Array.from(part)[0]?.toLocaleUpperCase())
    .join("");
}

export function toOwnerReservation(record: OwnerReservationRecord): OwnerReservation {
  // ponytail: the owner API does not expose restaurant timezone yet; use the project default until it does.
  const startsAt = dayjs(record.startsAt).tz("Asia/Ho_Chi_Minh");
  return {
    id: record.id,
    date: startsAt.format("YYYY-MM-DD"),
    time: startsAt.format("HH:mm"),
    guestName: record.customerName,
    initials: initials(record.customerName),
    table: "Not assigned",
    partySize: record.partySize,
    reservationStatus: reservationStatuses[record.status],
    visitStatus: record.visitStatus
      ? visitStatuses[record.visitStatus]
      : VisitStatus.Expected,
    preOrder: Boolean(record.preOrderNote),
    preOrderName: record.preOrderNote ?? undefined,
    note: record.specialRequest ?? undefined,
    phone: record.customerPhone,
    reference: record.reference,
    visits: 0,
    points: 0,
  };
}

export async function getOwnerReservations(signal?: AbortSignal) {
  const records = await apiFetch<OwnerReservationRecord[]>(
    apiEndpoints.ownerReservations,
    { cache: "no-store", signal },
  );
  return records.map(toOwnerReservation);
}

export async function getOwnerReservation(id: string, signal?: AbortSignal) {
  const record = await apiFetch<OwnerReservationRecord>(
    apiEndpoints.ownerReservation(id),
    { cache: "no-store", signal },
  );
  return toOwnerReservation(record);
}

async function postOwnerReservation(
  path: string,
  body?: Record<string, string>,
) {
  const csrf = await getCsrfToken();
  const record = await apiFetch<OwnerReservationRecord>(path, {
    method: "POST",
    headers: { [csrf.headerName]: csrf.token },
    body: body ? JSON.stringify(body) : undefined,
  });
  return toOwnerReservation(record);
}

export function confirmOwnerReservation(id: string) {
  return postOwnerReservation(apiEndpoints.confirmOwnerReservation(id));
}

export function declineOwnerReservation(id: string, reason: string) {
  return postOwnerReservation(apiEndpoints.declineOwnerReservation(id), { reason });
}
