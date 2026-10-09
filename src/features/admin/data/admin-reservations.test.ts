import { describe, expect, it } from "vitest";
import {
  ReservationStatus,
  VisitStatus,
} from "@/features/reservations/types";
import type { OwnerReservation } from "@/features/owner/types";
import {
  getAdminReservationDateRange,
  toAdminReservation,
} from "@/features/admin/data/admin-reservations";

const ownerReservation: OwnerReservation = {
  id: "reservation-id",
  reference: "SHK-123",
  guestName: "Minh Lam",
  initials: "ML",
  date: "2026-10-09",
  time: "18:30",
  table: "Not assigned",
  partySize: 4,
  reservationStatus: ReservationStatus.Confirmed,
  visitStatus: VisitStatus.Expected,
  phone: "0900000000",
  email: "minh@example.com",
  note: "Window seat",
  visits: 0,
  points: 0,
};

describe("admin reservation data", () => {
  it("maps the restaurant-scoped owner record", () => {
    expect(toAdminReservation(ownerReservation)).toMatchObject({
      id: "reservation-id",
      reference: "SHK-123",
      customer: "Minh Lam",
      status: "confirmed",
      checkIn: "pending",
      email: "minh@example.com",
    });
  });

  it("maps period filters to inclusive backend date ranges", () => {
    const today = new Date("2026-10-09T12:00:00");
    expect(getAdminReservationDateRange("all", today)).toEqual({});
    expect(getAdminReservationDateRange("today", today)).toEqual({
      dateFrom: "2026-10-09",
      dateTo: "2026-10-09",
    });
    expect(getAdminReservationDateRange("last7Days", today)).toEqual({
      dateFrom: "2026-10-03",
      dateTo: "2026-10-09",
    });
    expect(getAdminReservationDateRange("thisMonth", today)).toEqual({
      dateFrom: "2026-10-01",
      dateTo: "2026-10-31",
    });
  });
});
