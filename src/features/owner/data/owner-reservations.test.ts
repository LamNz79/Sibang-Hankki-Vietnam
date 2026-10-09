import { afterEach, describe, expect, it, vi } from "vitest";
import { ReservationStatus, VisitStatus } from "@/features/reservations/types";
import {
  cancelOwnerReservation,
  checkInOwnerReservation,
  completeOwnerReservation,
  confirmOwnerReservation,
  declineOwnerReservation,
  manuallyCheckInOwnerReservation,
  seatOwnerReservation,
  toOwnerReservation,
} from "./owner-reservations";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const pendingRecord = {
  id: "reservation-id",
  reference: "SHK-123",
  customerName: "Minh Lam",
  customerPhone: "0900000000",
  startsAt: "2026-10-05T11:30:00Z",
  endsAt: "2026-10-05T13:00:00Z",
  partySize: 7,
  status: "PENDING" as const,
  visitStatus: null,
  createdAt: "2026-10-01T00:00:00Z",
  updatedAt: "2026-10-02T00:00:00Z",
};

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

  it("confirms with the session CSRF token", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(Response.json({
        ...pendingRecord,
        status: "CONFIRMED",
        visitStatus: "EXPECTED",
      }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(confirmOwnerReservation("reservation-id")).resolves.toMatchObject({
      reservationStatus: ReservationStatus.Confirmed,
      visitStatus: VisitStatus.Expected,
    });
    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/owner/reservations/reservation-id/confirm",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
      }),
    ]);
  });

  it("declines with a reason and the session CSRF token", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(Response.json({
        ...pendingRecord,
        status: "DECLINED",
      }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      declineOwnerReservation("reservation-id", "Fully booked"),
    ).resolves.toMatchObject({ reservationStatus: ReservationStatus.Declined });
    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/owner/reservations/reservation-id/decline",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
        body: JSON.stringify({ reason: "Fully booked" }),
      }),
    ]);
  });

  it("cancels with a reason and the session CSRF token", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(Response.json({
        ...pendingRecord,
        status: "CANCELLED",
      }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      cancelOwnerReservation("reservation-id", "Restaurant closed"),
    ).resolves.toMatchObject({ reservationStatus: ReservationStatus.Cancelled });
    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/owner/reservations/reservation-id/cancel",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
        body: JSON.stringify({ reason: "Restaurant closed" }),
      }),
    ]);
  });

  it("checks in a reservation with the scanned token", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(Response.json({
        ...pendingRecord,
        status: "CONFIRMED",
        visitStatus: "ARRIVED",
      }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(checkInOwnerReservation("raw-token")).resolves.toMatchObject({
      reservationStatus: ReservationStatus.Confirmed,
      visitStatus: VisitStatus.Arrived,
    });
    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/owner/check-ins",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
        body: JSON.stringify({ checkInToken: "raw-token" }),
      }),
    ]);
  });

  it("manually checks in a reservation by id with CSRF", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(Response.json({
        ...pendingRecord,
        status: "CONFIRMED",
        visitStatus: "ARRIVED",
      }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      manuallyCheckInOwnerReservation("reservation-id"),
    ).resolves.toMatchObject({ visitStatus: VisitStatus.Arrived });
    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/owner/reservations/reservation-id/check-in",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
      }),
    ]);
  });

  it.each([
    ["seat", seatOwnerReservation, "SEATED", VisitStatus.Seated],
    ["complete", completeOwnerReservation, "COMPLETED", VisitStatus.Completed],
  ] as const)("posts the %s visit transition with CSRF", async (
    path,
    transition,
    backendStatus,
    expectedStatus,
  ) => {
    vi.stubEnv("API_BASE_URL", "");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(Response.json({
        ...pendingRecord,
        status: "CONFIRMED",
        visitStatus: backendStatus,
      }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(transition("reservation-id")).resolves.toMatchObject({
      visitStatus: expectedStatus,
    });
    expect(fetchMock.mock.calls[1]).toEqual([
      `/api/owner/reservations/reservation-id/${path}`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
      }),
    ]);
  });
});
