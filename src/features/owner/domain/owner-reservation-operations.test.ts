import { describe, expect, it } from "vitest";
import {
  applyOwnerReservationOverrides,
  createOwnerReservationOverride,
} from "@/features/owner/domain/owner-reservation-operations";
import type { OwnerReservation } from "@/features/owner/types";
import {
  ReservationStatus,
  VisitStatus,
} from "@/features/reservations/types";

const now = "2026-08-19T03:00:00.000Z";

const reservation: OwnerReservation = {
  id: "res-003",
  time: "18:30",
  guestName: "Park Ara",
  initials: "PA",
  date: "2026-08-19",
  table: "Not assigned",
  partySize: 3,
  reservationStatus: ReservationStatus.Pending,
  visitStatus: VisitStatus.Expected,
  reference: "SHK-0819-1830",
  visits: 3,
  points: 130,
};

describe("owner reservation operations", () => {
  it("creates a deterministic operational override", () => {
    const override = createOwnerReservationOverride(
      reservation.id,
      { reservationStatus: ReservationStatus.Confirmed },
      now,
    );

    expect(override).toEqual({
      id: reservation.id,
      reservationStatus: ReservationStatus.Confirmed,
      updatedAt: now,
    });
  });

  it("preserves existing fields when another operation is added", () => {
    const current = createOwnerReservationOverride(
      reservation.id,
      {
        reservationStatus: ReservationStatus.Confirmed,
        requestResponse: { kind: "pending" },
      },
      "2026-08-19T02:00:00.000Z",
    );
    const next = createOwnerReservationOverride(
      reservation.id,
      { visitStatus: VisitStatus.Arrived },
      now,
      current,
    );

    expect(next).toMatchObject({
      reservationStatus: ReservationStatus.Confirmed,
      visitStatus: VisitStatus.Arrived,
      requestResponse: { kind: "pending" },
      updatedAt: now,
    });
  });

  it("applies owner state without mutating the base reservation", () => {
    const override = createOwnerReservationOverride(
      reservation.id,
      {
        reservationStatus: ReservationStatus.Declined,
        requestResponse: { kind: "unavailable", reason: "Fully booked" },
      },
      now,
    );

    const [result] = applyOwnerReservationOverrides(
      [reservation],
      [override],
    );

    expect(result).toMatchObject({
      reservationStatus: ReservationStatus.Declined,
      requestResponse: { kind: "unavailable", reason: "Fully booked" },
    });
    expect(reservation.reservationStatus).toBe(ReservationStatus.Pending);
    expect(reservation.requestResponse).toBeUndefined();
  });

  it("retains object identity when no override matches", () => {
    const [result] = applyOwnerReservationOverrides([reservation], []);

    expect(result).toBe(reservation);
  });
});
