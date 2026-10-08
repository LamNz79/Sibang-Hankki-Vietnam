import { describe, expect, it } from "vitest";
import {
  findReservationById,
  getUpcomingConfirmedReservations,
  getReservationDisplaySlot,
  getReservationReference,
  getReservationStatusFlags,
  partitionCustomerReservations,
} from "@/features/reservations/domain/selectors";
import {
  ReservationStatus,
  VisitStatus,
  type CustomerReservation,
} from "@/features/reservations/domain/types";

function createFixture(
  overrides: Partial<CustomerReservation> = {},
): CustomerReservation {
  return {
    id: "reservation-42",
    restaurantSlug: "anan-saigon",
    restaurantName: "Anan Saigon",
    district: "District 1",
    cuisineLabel: "Vietnamese",
    date: "2026-08-12",
    time: "18:30",
    guests: 2,
    status: ReservationStatus.Pending,
    createdAt: "2026-08-01T03:00:00.000Z",
    ...overrides,
  };
}

describe("reservation selectors", () => {
  it("finds a reservation by id", () => {
    const reservation = createFixture();
    expect(findReservationById([reservation], reservation.id)).toBe(
      reservation,
    );
  });

  it("returns upcoming confirmed reservations in slot order", () => {
    const next = createFixture({
      id: "next",
      date: "2026-08-24",
      time: "18:00",
      status: ReservationStatus.Confirmed,
    });
    const later = createFixture({
      id: "later",
      date: "2026-08-25",
      status: ReservationStatus.Confirmed,
    });
    const past = createFixture({
      status: ReservationStatus.Confirmed,
    });
    const arrived = createFixture({
      id: "arrived",
      date: "2026-08-26",
      status: ReservationStatus.Confirmed,
      visitStatus: VisitStatus.Arrived,
    });

    expect(
      getUpcomingConfirmedReservations(
        [later, past, arrived, next],
        "2026-08-24T10:00",
      ),
    ).toEqual([next, later]);
  });

  it("uses the proposed slot only while customer action is required", () => {
    const reservation = createFixture({
      status: ReservationStatus.AlternativeProposed,
      alternativeProposal: {
        date: "2026-08-13",
        time: "19:00",
        proposedAt: "2026-08-10T03:00:00.000Z",
      },
    });

    expect(getReservationDisplaySlot(reservation)).toEqual({
      date: "2026-08-13",
      time: "19:00",
      isSuggested: true,
    });
    expect(getReservationStatusFlags(reservation).isAlternative).toBe(true);
  });

  it("returns an existing reference or generates a stable fallback", () => {
    expect(
      getReservationReference(createFixture({ reference: "CUSTOM-REF" })),
    ).toBe("CUSTOM-REF");
    expect(getReservationReference(createFixture())).toBe("SHK-260812-0042");
  });

  it("identifies a customer-cancelled reservation", () => {
    expect(
      getReservationStatusFlags(
        createFixture({ status: ReservationStatus.Cancelled }),
      ).isCancelled,
    ).toBe(true);
  });

  it("splits active future reservations from terminal and elapsed reservations", () => {
    const future = createFixture({ id: "future", date: "2026-10-09" });
    const later = createFixture({ id: "later", date: "2026-10-10" });
    const elapsed = createFixture({ id: "elapsed", date: "2026-10-07" });
    const cancelled = createFixture({
      id: "cancelled",
      date: "2026-10-11",
      status: ReservationStatus.Cancelled,
    });

    expect(
      partitionCustomerReservations(
        [cancelled, elapsed, later, future],
        "2026-10-08T12:00",
      ),
    ).toEqual({
      upcoming: [future, later],
      past: [cancelled, elapsed],
    });
  });
});
