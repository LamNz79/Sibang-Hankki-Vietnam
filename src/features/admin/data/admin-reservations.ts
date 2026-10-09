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

export function filterAdminReservations(
  records: AdminReservationRecord[],
  query: string,
  status: AdminReservationStatus | "all",
  period: "today" | "last7Days" | "thisMonth",
  today = new Date(),
) {
  const normalizedQuery = query.trim().toLowerCase();
  const todayKey = localDateKey(today);
  const firstDay = new Date(today);
  firstDay.setHours(0, 0, 0, 0);
  firstDay.setDate(firstDay.getDate() - 6);
  const firstDayKey = localDateKey(firstDay);
  const monthKey = todayKey.slice(0, 7);

  return records.filter((reservation) => {
    const matchesQuery =
      !normalizedQuery ||
      `${reservation.id} ${reservation.reference} ${reservation.customer} ${reservation.phone} ${reservation.email}`
        .toLowerCase()
        .includes(normalizedQuery);
    const matchesPeriod =
      period === "today"
        ? reservation.date === todayKey
        : period === "last7Days"
          ? reservation.date >= firstDayKey && reservation.date <= todayKey
          : reservation.date.startsWith(monthKey);

    return (
      matchesQuery &&
      (status === "all" || reservation.status === status) &&
      matchesPeriod
    );
  });
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
