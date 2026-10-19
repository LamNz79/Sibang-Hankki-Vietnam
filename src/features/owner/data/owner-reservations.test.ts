import { afterEach, describe, expect, it, vi } from "vitest";
import { ReservationStatus, VisitStatus } from "@/features/reservations/types";
import {
  cancelOwnerReservation,
  checkInOwnerReservation,
  completeOwnerReservation,
  confirmOwnerReservation,
  createOwnerWalkIn,
  declineOwnerReservation,
  getOwnerReservationPage,
  markNoShowOwnerReservation,
  manuallyCheckInOwnerReservation,
  proposeAlternativeOwnerReservation,
  respondToOwnerReservationChangeRequest,
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

  it("derives the customer response from both reservation and proposal status", () => {
    const declinedProposal = {
      id: "proposal-id",
      startsAt: "2026-10-17T04:30:00Z",
      message: null,
      respondBy: null,
      status: "DECLINED" as const,
      createdAt: "2026-10-16T00:00:00Z",
    };

    expect(toOwnerReservation({
      ...pendingRecord,
      alternativeProposal: declinedProposal,
    }).customerResponse).toEqual({ kind: "requested-another-time" });

    expect(toOwnerReservation({
      ...pendingRecord,
      status: "DECLINED",
      alternativeProposal: declinedProposal,
    }).customerResponse).toMatchObject({ kind: "declined-alternative" });

    expect(toOwnerReservation({
      ...pendingRecord,
      status: "CONFIRMED",
      visitStatus: "EXPECTED",
      alternativeProposal: declinedProposal,
    }).customerResponse).toBeUndefined();
  });

  it("maps and accepts a customer change request", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const changeRecord = {
      ...pendingRecord,
      status: "CONFIRMED" as const,
      visitStatus: "EXPECTED" as const,
      alternativeProposal: {
        id: "change-id",
        startsAt: "2026-10-17T04:30:00Z",
        message: "Later please",
        respondBy: null,
        status: "PENDING" as const,
        initiator: "CUSTOMER" as const,
        createdAt: "2026-10-16T00:00:00Z",
      },
    };
    expect(toOwnerReservation(changeRecord).customerResponse).toEqual({
      kind: "change-request",
      requestId: "change-id",
      requestedDate: "2026-10-17",
      requestedTime: "11:30",
      message: "Later please",
    });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(Response.json({
        ...changeRecord,
        startsAt: changeRecord.alternativeProposal.startsAt,
        alternativeProposal: {
          ...changeRecord.alternativeProposal,
          status: "ACCEPTED",
        },
      }));
    vi.stubGlobal("fetch", fetchMock);

    const accepted = await respondToOwnerReservationChangeRequest(
      "reservation-id",
      "change-id",
      "accept",
    );
    expect(accepted.customerResponse).toBeUndefined();
    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/owner/reservations/reservation-id/change-requests/change-id/accept",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
      }),
    ]);
  });

  it("requests a filtered owner reservation page", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const fetchMock = vi.fn().mockResolvedValue(Response.json({
      items: [pendingRecord],
      page: 1,
      size: 20,
      totalElements: 21,
      totalPages: 2,
      summary: { confirmed: 13, checkedIn: 3, cancelled: 2, noShow: 0 },
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getOwnerReservationPage({
      page: 1,
      size: 20,
      query: "Minh",
      status: "CONFIRMED",
      dateFrom: "2026-10-01",
      dateTo: "2026-10-31",
    })).resolves.toMatchObject({
      reservations: [expect.objectContaining({ id: "reservation-id" })],
      totalElements: 21,
      summary: { confirmed: 13, checkedIn: 3, cancelled: 2, noShow: 0 },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/owner/reservations/paged?page=1&size=20&query=Minh&status=CONFIRMED&dateFrom=2026-10-01&dateTo=2026-10-31",
      expect.objectContaining({ cache: "no-store" }),
    );
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

  it("creates a walk-in with CSRF and an idempotency key", async () => {
    vi.stubEnv("API_BASE_URL", "");
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "00000000-0000-4000-8000-000000000040",
    );
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
      }, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(createOwnerWalkIn({
      customerName: "Walk-in guest",
      customerPhone: "0901234567",
      partySize: 4,
      specialRequest: "Window",
    })).resolves.toMatchObject({
      reservationStatus: ReservationStatus.Confirmed,
      visitStatus: VisitStatus.Arrived,
    });
    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/owner/reservations/walk-ins",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-CSRF-TOKEN": "csrf-token",
          "Idempotency-Key": "00000000-0000-4000-8000-000000000040",
        }),
        body: JSON.stringify({
          customerName: "Walk-in guest",
          customerPhone: "0901234567",
          partySize: 4,
          specialRequest: "Window",
        }),
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

  it("sends an alternative-time proposal with CSRF", async () => {
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
        status: "ALTERNATIVE_PROPOSED",
        alternativeProposal: {
          id: "proposal-id",
          startsAt: "2026-10-05T12:30:00Z",
          message: "A later table is available",
          respondBy: null,
          status: "PENDING",
          createdAt: "2026-10-02T01:00:00Z",
        },
      }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(proposeAlternativeOwnerReservation("reservation-id", {
      proposedDate: "2026-10-05",
      proposedTime: "19:30",
      message: "A later table is available",
    })).resolves.toMatchObject({
      reservationStatus: ReservationStatus.AlternativeProposed,
      customerResponse: {
        kind: "awaiting-customer",
        proposedTime: "19:30",
      },
    });
    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/owner/reservations/reservation-id/proposals",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
        body: JSON.stringify({
          proposedDate: "2026-10-05",
          proposedTime: "19:30",
          message: "A later table is available",
        }),
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
    ["no-show", markNoShowOwnerReservation, "NO_SHOW", VisitStatus.NoShow],
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
