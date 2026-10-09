import {
  ReservationStatus,
  VisitStatus,
} from "@/features/reservations/types";
import type { OwnerReservation } from "@/features/owner/types";

export type AdminReservationStatus =
  | "pending"
  | "confirmed"
  | "checkedIn"
  | "cancelled"
  | "declined"
  | "noShow";

export type AdminReservationPeriod =
  | "all"
  | "today"
  | "last7Days"
  | "thisMonth";

export type AdminReservationRecord = {
  id: string;
  reference: string;
  customer: string;
  time: string;
  partySize: number;
  checkIn: "complete" | "pending" | "none";
  status: AdminReservationStatus;
  date: string;
  phone: string;
  email: string;
  request: string;
};

export function toAdminReservation(
  reservation: OwnerReservation,
): AdminReservationRecord {
  const status = (() => {
    if (reservation.reservationStatus === ReservationStatus.Cancelled) {
      return "cancelled";
    }
    if (
      reservation.reservationStatus === ReservationStatus.Declined ||
      reservation.reservationStatus === ReservationStatus.Expired
    ) {
      return "declined";
    }
    if (
      reservation.reservationStatus === ReservationStatus.Pending ||
      reservation.reservationStatus === ReservationStatus.AlternativeProposed
    ) {
      return "pending";
    }
    if (reservation.visitStatus === VisitStatus.NoShow) return "noShow";
    return reservation.visitStatus === VisitStatus.Expected
      ? "confirmed"
      : "checkedIn";
  })() satisfies AdminReservationStatus;

  return {
    id: reservation.id,
    reference: reservation.reference,
    customer: reservation.guestName,
    time: reservation.time,
    partySize: reservation.partySize,
    checkIn:
      status === "checkedIn"
        ? "complete"
        : status === "confirmed"
          ? "pending"
          : "none",
    status,
    date: reservation.date,
    phone: reservation.phone ?? "",
    email: reservation.email ?? "",
    request: reservation.note ?? "",
  };
}

export function getAdminReservationDateRange(
  period: AdminReservationPeriod,
  today = new Date(),
) {
  if (period === "all") return {};
  const todayKey = localDateKey(today);
  if (period === "today") return { dateFrom: todayKey, dateTo: todayKey };
  if (period === "last7Days") {
    const firstDay = new Date(today);
    firstDay.setHours(0, 0, 0, 0);
    firstDay.setDate(firstDay.getDate() - 6);
    return { dateFrom: localDateKey(firstDay), dateTo: todayKey };
  }
  return {
    dateFrom: localDateKey(new Date(today.getFullYear(), today.getMonth(), 1)),
    dateTo: localDateKey(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
  };
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
