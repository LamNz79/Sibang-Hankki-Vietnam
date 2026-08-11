import { describe, expect, it } from "vitest";
import {
  findReservationById,
  getReservationDisplaySlot,
  getReservationReference,
  getReservationStatusFlags,
} from "@/features/reservations/domain/selectors";
import {
  ReservationStatus,
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
});
