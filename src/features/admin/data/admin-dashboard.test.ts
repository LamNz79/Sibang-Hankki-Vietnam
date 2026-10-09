import { describe, expect, it } from "vitest";
import { ReservationStatus, VisitStatus } from "@/features/reservations/types";
import type { OwnerReservation } from "@/features/owner/types";
import { buildAdminDashboard } from "./admin-dashboard";

const reservation: OwnerReservation = {
  id: "reservation-1",
  reference: "SHK-1",
  guestName: "Minh Lam",
  initials: "ML",
  phone: "0901234567",
  date: "2026-10-09",
  time: "18:30",
  table: "Not assigned",
  partySize: 2,
  reservationStatus: ReservationStatus.Confirmed,
  visitStatus: VisitStatus.Arrived,
  visits: 0,
  points: 0,
};

describe("admin dashboard data", () => {
  it("derives today's metrics, weekly trend, and pending work", () => {
    const dashboard = buildAdminDashboard([
      reservation,
      {
        ...reservation,
        id: "pending",
        date: "2026-10-08",
        reservationStatus: ReservationStatus.Pending,
        visitStatus: VisitStatus.Expected,
      },
      {
        ...reservation,
        id: "no-show",
        visitStatus: VisitStatus.NoShow,
      },
    ], "2026-10-09");

    expect(dashboard.metrics).toEqual({
      bookings: 2,
      checkedIn: 1,
      pending: 0,
      noShow: 1,
    });
    expect(dashboard.weeklyTrend.at(-1)).toEqual({
      date: "2026-10-09",
      count: 2,
    });
    expect(dashboard.pendingReservations.map(({ id }) => id)).toEqual(["pending"]);
    expect(dashboard.pendingTotal).toBe(1);
  });
});
