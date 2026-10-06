import { afterEach, describe, expect, it, vi } from "vitest";
import { ReservationStatus, type CustomerReservation } from "@/features/reservations/types";
import {
  cancelCustomerReservation,
  getCustomerReservation,
  mergeCustomerReservation,
} from "./customer-reservations";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const stored: CustomerReservation = {
  id: "reservation-id",
  reference: "SHK-123",
  managementToken: "management-token",
  restaurantSlug: "royal-pavilion",
  restaurantName: "The Royal Pavilion",
  district: "District 1",
  cuisineLabel: "Chinese",
  date: "2026-10-08",
  time: "13:30",
  guests: 7,
  status: ReservationStatus.Pending,
  createdAt: "2026-10-06T00:00:00Z",
};

const confirmedRecord = {
  id: "reservation-id",
  reference: "SHK-123",
  startsAt: "2026-10-08T06:30:00Z",
  partySize: 7,
  status: "CONFIRMED" as const,
  specialRequest: null,
  preOrderNote: null,
  createdAt: "2026-10-06T00:00:00Z",
  updatedAt: "2026-10-06T03:00:00Z",
};

describe("customer reservation API", () => {
  it("merges backend status with locally stored restaurant context", () => {
    expect(mergeCustomerReservation(stored, confirmedRecord)).toMatchObject({
      restaurantName: "The Royal Pavilion",
      date: "2026-10-08",
      time: "13:30",
      status: ReservationStatus.Confirmed,
      updatedAt: "2026-10-06T03:00:00Z",
    });
  });

  it("reads a reservation with its management token", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const fetchMock = vi.fn().mockResolvedValue(Response.json(confirmedRecord));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCustomerReservation(stored)).resolves.toMatchObject({
      status: ReservationStatus.Confirmed,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/customer/reservations/reservation-id",
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Reservation-Management-Token": "management-token",
        }),
      }),
    );
  });

  it("cancels with the same management token", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const fetchMock = vi.fn().mockResolvedValue(Response.json({
      ...confirmedRecord,
      status: "CANCELLED",
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(cancelCustomerReservation(stored)).resolves.toMatchObject({
      status: ReservationStatus.Cancelled,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/customer/reservations/reservation-id/cancel",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Reservation-Management-Token": "management-token",
        }),
      }),
    );
  });
});
