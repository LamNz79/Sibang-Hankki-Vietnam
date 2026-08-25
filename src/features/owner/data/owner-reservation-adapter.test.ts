import { describe, expect, it } from "vitest";
import { mergeOwnerReservationsWithCustomerState } from "@/features/owner/data/owner-reservation-adapter";
import type { OwnerReservation } from "@/features/owner/types";
import {
  ReservationCustomerAction,
  ReservationStatus,
  VisitStatus,
  type CustomerReservation,
} from "@/features/reservations/types";

const ownerReservation: OwnerReservation = {
  id: "res-002",
  time: "18:00",
  guestName: "Kim Minji",
  initials: "KM",
  date: "2026-08-10",
  table: "Table A-12",
  partySize: 4,
  reservationStatus: ReservationStatus.Confirmed,
  visitStatus: VisitStatus.Expected,
  reference: "SHK-0720-1800",
  visits: 7,
  points: 420,
};

function createCustomerFixture(
  overrides: Partial<CustomerReservation> = {},
): CustomerReservation {
  return {
    id: ownerReservation.id,
    restaurantSlug: "royal-pavilion",
    restaurantName: "The Royal Pavilion",
    district: "District 1",
    cuisineLabel: "Chinese",
    date: ownerReservation.date,
    time: ownerReservation.time,
    guests: ownerReservation.partySize,
    status: ReservationStatus.Pending,
    reference: ownerReservation.reference,
    createdAt: "2026-08-01T03:00:00.000Z",
    ...overrides,
  };
}

describe("owner reservation adapter", () => {
  it("maps an awaiting-customer proposal", () => {
    const customerReservation = createCustomerFixture({
      status: ReservationStatus.AlternativeProposed,
      alternativeProposal: {
        date: "2026-08-10",
        time: "18:30",
        message: "Would 18:30 work?",
        proposedAt: "2026-08-09T03:00:00.000Z",
      },
    });

    const [result] = mergeOwnerReservationsWithCustomerState(
      [ownerReservation],
      [customerReservation],
    );

    expect(result.customerResponse).toEqual({
      kind: "awaiting-customer",
      proposedDate: "2026-08-10",
      proposedTime: "18:30",
      message: "Would 18:30 work?",
    });
  });

  it("maps an accepted alternative and its new slot", () => {
    const customerReservation = createCustomerFixture({
      date: "2026-08-11",
      time: "19:00",
      status: ReservationStatus.Confirmed,
      previousDate: "2026-08-10",
      previousTime: "18:00",
      customerAction: ReservationCustomerAction.AcceptedAlternative,
    });

    const [result] = mergeOwnerReservationsWithCustomerState(
      [ownerReservation],
      [customerReservation],
    );

    expect(result).toMatchObject({
      date: "2026-08-11",
      time: "19:00",
      reservationStatus: ReservationStatus.Confirmed,
      customerResponse: {
        kind: "accepted-alternative",
        previousDate: "2026-08-10",
        previousTime: "18:00",
      },
    });
  });

  it("adds a new customer request without changing owner records", () => {
    const [result, addedReservation] = mergeOwnerReservationsWithCustomerState(
      [ownerReservation],
      [
        createCustomerFixture({
          id: "another-id",
          reference: "OTHER",
          checkInToken: "opaque-token",
        }),
      ],
    );

    expect(result).toBe(ownerReservation);
    expect(addedReservation).toMatchObject({
      id: "another-id",
      guestName: "Minh Lam",
      initials: "ML",
      table: "Not assigned",
      partySize: 4,
      reservationStatus: ReservationStatus.Pending,
      visitStatus: VisitStatus.Expected,
      reference: "OTHER",
      checkInToken: "opaque-token",
      visits: 0,
      points: 0,
    });
  });
});
