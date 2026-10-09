import dayjs from "dayjs";
import { ReservationStatus, VisitStatus } from "@/features/reservations/types";
import type { OwnerReservation } from "@/features/owner/types";

export function buildAdminDashboard(
  reservations: OwnerReservation[],
  today = dayjs().format("YYYY-MM-DD"),
) {
  const todayReservations = reservations.filter(({ date }) => date === today);
  const pendingReservations = reservations
    .filter(({ reservationStatus }) =>
      [ReservationStatus.Pending, ReservationStatus.AlternativeProposed].includes(
        reservationStatus,
      ),
    )
    .sort((left, right) =>
      `${left.date}T${left.time}`.localeCompare(`${right.date}T${right.time}`),
    );
  const days = Array.from({ length: 7 }, (_, index) =>
    dayjs(today).subtract(6 - index, "day").format("YYYY-MM-DD"),
  );

  return {
    metrics: {
      bookings: todayReservations.length,
      checkedIn: todayReservations.filter(({ visitStatus }) =>
        [VisitStatus.Arrived, VisitStatus.Seated, VisitStatus.Completed].includes(
          visitStatus,
        ),
      ).length,
      pending: todayReservations.filter(({ reservationStatus }) =>
        [ReservationStatus.Pending, ReservationStatus.AlternativeProposed].includes(
          reservationStatus,
        ),
      ).length,
      noShow: todayReservations.filter(
        ({ visitStatus }) => visitStatus === VisitStatus.NoShow,
      ).length,
    },
    weeklyTrend: days.map((date) => ({
      date,
      count: reservations.filter((reservation) => reservation.date === date).length,
    })),
    pendingReservations: pendingReservations.slice(0, 4),
    pendingTotal: pendingReservations.length,
  };
}
