import { describe, expect, it } from "vitest";
import {
  countOwnerReservationGuestFilter,
  findOwnerReservationByCheckInToken,
  getOwnerReservationDisplayStatus,
  isOwnerReservationActionRequired,
  isOwnerReservationActive,
  isOwnerReservationNextArrival,
  matchesOwnerReservationGuestFilters,
  matchesOwnerReservationSearch,
  sortOwnerReservationsPendingFirst,
} from "@/features/owner/selectors/owner-reservation-selectors";
import type { OwnerReservation } from "@/features/owner/types";
import { ReservationStatus, VisitStatus } from "@/features/reservations/types";

function createFixture(
  overrides: Partial<OwnerReservation> = {},
): OwnerReservation {
  return {
    id: "res-002",
    time: "18:00",
    guestName: "Kim Minji",
    initials: "KM",
    date: "2026-08-10",
    table: "Table A-12",
    partySize: 4,
    reservationStatus: ReservationStatus.Confirmed,
    visitStatus: VisitStatus.Expected,
    tier: "vip",
    preOrder: true,
    phone: "090 555 1800",
    reference: "SHK-0720-1800",
    visits: 7,
    points: 420,
    ...overrides,
  };
}

describe("owner reservation selectors", () => {
  it("uses visit status after a guest has arrived", () => {
    const reservation = createFixture({ visitStatus: VisitStatus.Seated });
    expect(getOwnerReservationDisplayStatus(reservation)).toBe(
      VisitStatus.Seated,
    );
  });

  it("matches guest attributes and counts them", () => {
    const reservation = createFixture();
    expect(
      matchesOwnerReservationGuestFilters(reservation, [
        "vip",
        "pre-order",
        "large-party",
      ]),
    ).toBe(true);
    expect(countOwnerReservationGuestFilter([reservation], "vip")).toBe(1);
  });

  it("searches normalized guest, reference and phone values", () => {
    const reservation = createFixture();
    expect(matchesOwnerReservationSearch(reservation, "kim minji")).toBe(true);
    expect(matchesOwnerReservationSearch(reservation, "0720-1800")).toBe(true);
    expect(matchesOwnerReservationSearch(reservation, "090555")).toBe(true);
    expect(matchesOwnerReservationSearch(reservation, "not found")).toBe(false);
  });

  it("finds a reservation by opaque check-in token", () => {
    const reservation = createFixture({ checkInToken: "opaque-token" });
    expect(
      findOwnerReservationByCheckInToken([reservation], "opaque-token"),
    ).toBe(reservation);
  });

  it("identifies reservations requiring owner action", () => {
    expect(
      isOwnerReservationActionRequired(
        createFixture({ reservationStatus: ReservationStatus.Pending }),
      ),
    ).toBe(true);
    expect(
      isOwnerReservationActionRequired(
        createFixture({
          customerResponse: { kind: "declined-alternative" },
        }),
      ),
    ).toBe(true);
  });

  it("identifies active reservations and next-arrival candidates", () => {
    const reservation = createFixture();
    expect(isOwnerReservationActive(reservation)).toBe(true);
    expect(isOwnerReservationNextArrival(reservation)).toBe(true);
    expect(
      isOwnerReservationActive(
        createFixture({ reservationStatus: ReservationStatus.Declined }),
      ),
    ).toBe(false);
  });

  it("sorts pending requests first and each group by time", () => {
    const reservations = [
      createFixture({ id: "confirmed-late", time: "19:00" }),
      createFixture({
        id: "pending-late",
        time: "18:30",
        reservationStatus: ReservationStatus.Pending,
      }),
      createFixture({ id: "confirmed-early", time: "17:30" }),
      createFixture({
        id: "pending-early",
        time: "18:00",
        reservationStatus: ReservationStatus.Pending,
      }),
    ];

    expect(
      sortOwnerReservationsPendingFirst(reservations).map(({ id }) => id),
    ).toEqual([
      "pending-early",
      "pending-late",
      "confirmed-early",
      "confirmed-late",
    ]);
  });
});
