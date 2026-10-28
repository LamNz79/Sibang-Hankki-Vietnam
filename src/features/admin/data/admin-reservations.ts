import {
  ReservationStatus,
  VisitStatus,
} from "@/features/reservations/types";
import type { OwnerReservation } from "@/features/owner/types";
import dayjs from "dayjs";
import { getRestaurantDateKey } from "@/lib/date-time";

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

export type AdminReservationPrimaryAction =
  | "confirm"
  | "checkIn"
  | "seat"
  | "complete";

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

export function getAdminReservationPrimaryAction(
  reservation: OwnerReservation,
): AdminReservationPrimaryAction | null {
  if (reservation.reservationStatus === ReservationStatus.Pending) {
    return "confirm";
  }
  if (reservation.reservationStatus !== ReservationStatus.Confirmed) {
    return null;
  }
  if (reservation.visitStatus === VisitStatus.Expected) return "checkIn";
  if (reservation.visitStatus === VisitStatus.Arrived) return "seat";
  if (reservation.visitStatus === VisitStatus.Seated) return "complete";
  return null;
}

export function canAdminTerminateReservation(reservation: OwnerReservation) {
  return (
    reservation.reservationStatus === ReservationStatus.Confirmed &&
    reservation.visitStatus === VisitStatus.Expected
  );
}

export function getAdminReservationDateRange(
  period: AdminReservationPeriod,
  today = new Date(),
) {
  if (period === "all") return {};
  const todayKey = getRestaurantDateKey(today);
  if (period === "today") return { dateFrom: todayKey, dateTo: todayKey };
  if (period === "last7Days") {
    return {
      dateFrom: dayjs(todayKey).subtract(6, "day").format("YYYY-MM-DD"),
      dateTo: todayKey,
    };
  }
  return {
    dateFrom: dayjs(todayKey).startOf("month").format("YYYY-MM-DD"),
    dateTo: dayjs(todayKey).endOf("month").format("YYYY-MM-DD"),
  };
}
