import { afterEach, describe, expect, it, vi } from "vitest";
import { ReservationStatus, type CustomerReservation } from "@/features/reservations/types";
import {
  cancelCustomerReservation,
  getAccountReservations,
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

const accountRecord = {
  ...confirmedRecord,
  restaurantSlug: "royal-pavilion",
  restaurantName: "The Royal Pavilion",
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

  it("reads reservations linked to the signed-in customer", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const fetchMock = vi.fn().mockResolvedValue(Response.json([accountRecord]));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getAccountReservations()).resolves.toEqual([
      expect.objectContaining({
        id: "reservation-id",
        restaurantName: "The Royal Pavilion",
        district: "District 1",
        accountLinked: true,
        status: ReservationStatus.Confirmed,
      }),
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/customer/account/reservations",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("gets CSRF before cancelling an account reservation", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(Response.json({
        ...accountRecord,
        status: "CANCELLED",
      }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(cancelCustomerReservation({
      ...stored,
      managementToken: undefined,
      accountLinked: true,
    })).resolves.toMatchObject({ status: ReservationStatus.Cancelled });
    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/customer/account/reservations/reservation-id/cancel",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-CSRF-TOKEN": "csrf-token",
        },
      },
    ]);
  });
});
