import { describe, expect, it } from "vitest";
import { ReservationStatus, VisitStatus } from "@/features/reservations/types";
import type { OwnerReservation } from "@/features/owner/types";
import { buildOwnerGuests, getOwnerGuestStats } from "./owner-guests";

const reservation: OwnerReservation = {
  id: "reservation-1",
  reference: "SHK-1",
  guestName: "Minh Lam",
  initials: "ML",
  phone: "090 123 4567",
  email: "minh@example.com",
  date: "2026-10-09",
  time: "18:30",
  table: "Not assigned",
  partySize: 2,
  reservationStatus: ReservationStatus.Confirmed,
  visitStatus: VisitStatus.Completed,
  visits: 0,
  points: 0,
};

describe("owner guest summaries", () => {
  it("groups booking history by normalized phone and counts visits", () => {
    const guests = buildOwnerGuests([
      reservation,
      {
        ...reservation,
        id: "reservation-2",
        phone: "0901234567",
        date: "2026-10-10",
        visitStatus: VisitStatus.NoShow,
      },
    ]);

    expect(guests).toEqual([
      expect.objectContaining({
        id: "0901234567",
        reservations: 2,
        visits: 1,
        noShows: 1,
        lastReservation: "2026-10-10",
      }),
    ]);
  });

  it("calculates repeat guests and return rate from completed visits", () => {
    const guests = buildOwnerGuests([
      reservation,
      { ...reservation, id: "reservation-2", date: "2026-10-08" },
      {
        ...reservation,
        id: "reservation-3",
        phone: "0987654321",
        guestName: "New Guest",
      },
    ]);

    expect(getOwnerGuestStats(guests)).toEqual({
      profiles: 2,
      repeatGuests: 1,
      returnRate: 50,
    });
  });
});
