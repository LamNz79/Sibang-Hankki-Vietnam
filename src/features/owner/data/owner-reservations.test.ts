import { describe, expect, it } from "vitest";
import { ReservationStatus, VisitStatus } from "@/features/reservations/types";
import { toOwnerReservation } from "./owner-reservations";

describe("owner reservation API mapping", () => {
  it("maps backend timestamps and statuses to the existing owner UI", () => {
    expect(toOwnerReservation({
      id: "reservation-id",
      reference: "SHK-123",
      customerName: "Minh Lam",
      customerPhone: "0900000000",
      startsAt: "2026-10-05T11:30:00Z",
      endsAt: "2026-10-05T13:00:00Z",
      partySize: 2,
      status: "CONFIRMED",
      visitStatus: "EXPECTED",
      specialRequest: "Window seat",
      preOrderNote: "No peanuts",
      createdAt: "2026-10-01T00:00:00Z",
      updatedAt: "2026-10-02T00:00:00Z",
    })).toMatchObject({
      id: "reservation-id",
      date: "2026-10-05",
      time: "18:30",
      guestName: "Minh Lam",
      initials: "ML",
      reservationStatus: ReservationStatus.Confirmed,
      visitStatus: VisitStatus.Expected,
      preOrder: true,
      preOrderName: "No peanuts",
    });
  });
});
