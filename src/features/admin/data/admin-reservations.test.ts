import { describe, expect, it } from "vitest";
import {
  ReservationStatus,
  VisitStatus,
} from "@/features/reservations/types";
import type { OwnerReservation } from "@/features/owner/types";
import {
  filterAdminReservations,
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

  it("combines query, status, and period filters", () => {
    const records = [
      toAdminReservation(ownerReservation),
      toAdminReservation({
        ...ownerReservation,
        id: "older",
        reference: "SHK-OLD",
        date: "2026-10-02",
        reservationStatus: ReservationStatus.Cancelled,
      }),
    ];

    expect(
      filterAdminReservations(
        records,
        "minh@example.com",
        "confirmed",
        "today",
        new Date("2026-10-09T12:00:00"),
      ).map(({ id }) => id),
    ).toEqual(["reservation-id"]);
    expect(
      filterAdminReservations(
        records,
        "",
        "all",
        "thisMonth",
        new Date("2026-10-09T12:00:00"),
      ),
    ).toHaveLength(2);
  });
});
