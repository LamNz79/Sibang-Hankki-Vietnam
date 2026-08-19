import { describe, expect, it } from "vitest";
import {
  acceptAlternative,
  confirmReservation,
  createReservationRequest,
  declineAlternative,
  proposeAlternative,
  rejectReservation,
  reopenReservation,
} from "@/features/reservations/domain/transitions";
import {
  ReservationCustomerAction,
  ReservationStatus,
  type CustomerReservation,
} from "@/features/reservations/domain/types";

const now = "2026-08-10T03:00:00.000Z";

function createFixture(
  overrides: Partial<CustomerReservation> = {},
): CustomerReservation {
  return {
    id: "res-001",
    restaurantSlug: "royal-pavilion",
    restaurantName: "The Royal Pavilion",
    district: "District 1",
    cuisineLabel: "Chinese",
    date: "2026-08-12",
    time: "18:30",
    guests: 2,
    status: ReservationStatus.Pending,
    reference: "SHK-0812-1830",
    createdAt: "2026-08-01T03:00:00.000Z",
    ...overrides,
  };
}

describe("reservation transitions", () => {
  it("creates a pending reservation request deterministically", () => {
    const reservation = createReservationRequest(
      {
        id: "new-001",
        restaurantSlug: "anan-saigon",
        restaurantName: "Anan Saigon",
        district: "District 1",
        cuisineLabel: "Vietnamese",
        date: "2026-08-15",
        time: "19:00",
        guests: 4,
      },
      now,
    );

    expect(reservation).toMatchObject({
      id: "new-001",
      status: ReservationStatus.Pending,
      createdAt: now,
      updatedAt: now,
    });
    expect(reservation.customerAction).toBeUndefined();
  });

  it("creates a new-time request while preserving booking context", () => {
    const existing = createFixture({
      preOrder: "Korean sharing set",
      specialRequest: "Window seat",
    });

    const reservation = createReservationRequest(
      {
        id: existing.id,
        restaurantSlug: existing.restaurantSlug,
        restaurantName: existing.restaurantName,
        district: existing.district,
        cuisineLabel: existing.cuisineLabel,
        date: "2026-08-13",
        time: "20:00",
        guests: 4,
      },
      now,
      existing,
    );

    expect(reservation).toMatchObject({
      reference: existing.reference,
      previousDate: existing.date,
      previousTime: existing.time,
      preOrder: existing.preOrder,
      specialRequest: existing.specialRequest,
      customerAction: ReservationCustomerAction.RequestedAnotherTime,
      createdAt: existing.createdAt,
      updatedAt: now,
    });
  });

  it("proposes an alternative without mutating the original reservation", () => {
    const existing = createFixture();
    const next = proposeAlternative(
      {
        ...existing,
        reference: undefined,
        preOrder: "Korean sharing set",
        specialRequest: "Window seat",
        proposedDate: "2026-08-12",
        proposedTime: "18:00",
        message: "Would an earlier table work?",
      },
      now,
      existing,
    );

    expect(existing.status).toBe(ReservationStatus.Pending);
    expect(next.status).toBe(ReservationStatus.AlternativeProposed);
    expect(next.reference).toBe(existing.reference);
    expect(next.preOrder).toBe("Korean sharing set");
    expect(next.specialRequest).toBe("Window seat");
    expect(next.alternativeProposal).toEqual({
      date: "2026-08-12",
      time: "18:00",
      message: "Would an earlier table work?",
      proposedAt: now,
      respondBy: undefined,
    });
  });

  it("accepts a proposal and moves it into the confirmed slot", () => {
    const reservation = createFixture({
      status: ReservationStatus.AlternativeProposed,
      alternativeProposal: {
        date: "2026-08-12",
        time: "18:00",
        proposedAt: "2026-08-09T03:00:00.000Z",
      },
    });

    const next = acceptAlternative(reservation, now);

    expect(next).toMatchObject({
      date: "2026-08-12",
      time: "18:00",
      previousDate: "2026-08-12",
      previousTime: "18:30",
      status: ReservationStatus.Confirmed,
      customerAction: ReservationCustomerAction.AcceptedAlternative,
      updatedAt: now,
    });
    expect(next?.alternativeProposal).toBeUndefined();
    expect(reservation.alternativeProposal).toBeDefined();
  });

  it("does not accept a reservation without an alternative proposal", () => {
    expect(acceptAlternative(createFixture(), now)).toBeUndefined();
  });

  it("declines a proposal while retaining its context", () => {
    const reservation = createFixture({
      status: ReservationStatus.AlternativeProposed,
      alternativeProposal: {
        date: "2026-08-12",
        time: "18:00",
        proposedAt: "2026-08-09T03:00:00.000Z",
      },
    });

    const next = declineAlternative(reservation, now);

    expect(next.status).toBe(ReservationStatus.Declined);
    expect(next.customerAction).toBe(
      ReservationCustomerAction.DeclinedAlternative,
    );
    expect(next.alternativeProposal).toEqual(reservation.alternativeProposal);
  });

  it("confirms a request and clears obsolete proposal state", () => {
    const reservation = createFixture({
      status: ReservationStatus.AlternativeProposed,
      alternativeProposal: {
        date: "2026-08-12",
        time: "18:00",
        proposedAt: "2026-08-09T03:00:00.000Z",
      },
      customerAction: ReservationCustomerAction.DeclinedAlternative,
    });

    const next = confirmReservation(reservation, now);

    expect(next.status).toBe(ReservationStatus.Confirmed);
    expect(next.updatedAt).toBe(now);
    expect(next.customerAction).toBeUndefined();
    expect(next.alternativeProposal).toBeUndefined();
  });

  it("records a restaurant rejection without a customer action", () => {
    const reservation = createFixture({
      customerAction: ReservationCustomerAction.RequestedAnotherTime,
    });

    const next = rejectReservation(reservation, now);

    expect(next.status).toBe(ReservationStatus.Declined);
    expect(next.updatedAt).toBe(now);
    expect(next.customerAction).toBeUndefined();
  });

  it("reopens a closed request as pending", () => {
    const reservation = createFixture({
      status: ReservationStatus.Declined,
      customerAction: ReservationCustomerAction.DeclinedAlternative,
      alternativeProposal: {
        date: "2026-08-12",
        time: "18:00",
        proposedAt: "2026-08-09T03:00:00.000Z",
      },
    });

    const next = reopenReservation(reservation, now);

    expect(next.status).toBe(ReservationStatus.Pending);
    expect(next.updatedAt).toBe(now);
    expect(next.customerAction).toBeUndefined();
    expect(next.alternativeProposal).toBeUndefined();
  });
});
