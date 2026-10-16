import { afterEach, describe, expect, it, vi } from "vitest";
import { ReservationStatus, VisitStatus, type CustomerReservation } from "@/features/reservations/types";
import {
  cancelCustomerReservation,
  getAccountReservations,
  getCustomerAccountReservation,
  getCustomerReservation,
  issueCustomerCheckInToken,
  mergeCustomerReservation,
  requestAnotherTime,
  respondToAlternativeProposal,
  selectVisibleReservations,
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
  visitStatus: "EXPECTED" as const,
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

const proposalRecord = {
  ...accountRecord,
  status: "ALTERNATIVE_PROPOSED" as const,
  alternativeProposal: {
    id: "proposal-id",
    startsAt: "2026-10-08T11:00:00Z",
    message: "A later table is available",
    respondBy: null,
    status: "PENDING" as const,
    createdAt: "2026-10-06T04:00:00Z",
  },
};

describe("customer reservation API", () => {
  it("merges backend status with locally stored restaurant context", () => {
    expect(mergeCustomerReservation(stored, confirmedRecord)).toMatchObject({
      restaurantName: "The Royal Pavilion",
      date: "2026-10-08",
      time: "13:30",
      status: ReservationStatus.Confirmed,
      visitStatus: VisitStatus.Expected,
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

  it("loads an account reservation detail with its proposal", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const fetchMock = vi.fn().mockResolvedValue(Response.json(proposalRecord));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCustomerAccountReservation({
      ...stored,
      accountLinked: true,
      managementToken: undefined,
    })).resolves.toMatchObject({
      status: ReservationStatus.AlternativeProposed,
      alternativeProposal: {
        id: "proposal-id",
        date: "2026-10-08",
        time: "18:00",
      },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/customer/account/reservations/reservation-id",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("accepts a guest proposal with its management token", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const fetchMock = vi.fn().mockResolvedValue(Response.json({
      ...proposalRecord,
      status: "CONFIRMED",
      alternativeProposal: {
        ...proposalRecord.alternativeProposal,
        status: "ACCEPTED",
      },
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(respondToAlternativeProposal({
      ...stored,
      alternativeProposal: {
        id: "proposal-id",
        date: "2026-10-08",
        time: "18:00",
        proposedAt: "2026-10-06T04:00:00Z",
      },
    }, "accept")).resolves.toMatchObject({
      status: ReservationStatus.Confirmed,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/customer/reservations/reservation-id/proposals/proposal-id/accept",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Reservation-Management-Token": "management-token",
        }),
      }),
    );
  });

  it("requests another time for a guest reservation", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const fetchMock = vi.fn().mockResolvedValue(Response.json({
      ...proposalRecord,
      startsAt: "2026-10-09T12:00:00Z",
      status: "PENDING",
      alternativeProposal: null,
    }));
    vi.stubGlobal("fetch", fetchMock);

    const reservation = {
      ...stored,
      status: ReservationStatus.AlternativeProposed,
      alternativeProposal: {
        id: "proposal-id",
        date: "2026-10-08",
        time: "18:00",
        proposedAt: "2026-10-06T04:00:00Z",
      },
    };
    await expect(
      requestAnotherTime(reservation, "2026-10-09", "19:00"),
    ).resolves.toMatchObject({
      id: "reservation-id",
      status: ReservationStatus.Pending,
      date: "2026-10-09",
      time: "19:00",
      alternativeProposal: undefined,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/customer/reservations/reservation-id/proposals/proposal-id/request-another-time",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Reservation-Management-Token": "management-token",
        }),
        body: JSON.stringify({
          requestedDate: "2026-10-09",
          requestedTime: "19:00",
        }),
      }),
    );
  });

  it("requests another time for an account reservation with CSRF", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(Response.json({
        ...proposalRecord,
        status: "PENDING",
        alternativeProposal: null,
      }));
    vi.stubGlobal("fetch", fetchMock);

    await requestAnotherTime({
      ...stored,
      managementToken: undefined,
      accountLinked: true,
      status: ReservationStatus.AlternativeProposed,
      alternativeProposal: {
        id: "proposal-id",
        date: "2026-10-08",
        time: "18:00",
        proposedAt: "2026-10-06T04:00:00Z",
      },
    }, "2026-10-09", "19:00");

    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/customer/account/reservations/reservation-id/proposals/proposal-id/request-another-time",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
      }),
    ]);
  });

  it("ignores proposals that are no longer pending", () => {
    expect(mergeCustomerReservation(stored, {
      ...proposalRecord,
      status: "PENDING",
      alternativeProposal: {
        ...proposalRecord.alternativeProposal,
        status: "DECLINED",
      },
    }).alternativeProposal).toBeUndefined();
  });

  it("declines an account proposal with CSRF", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(Response.json({
        ...proposalRecord,
        status: "DECLINED",
        alternativeProposal: {
          ...proposalRecord.alternativeProposal,
          status: "DECLINED",
        },
      }));
    vi.stubGlobal("fetch", fetchMock);

    await respondToAlternativeProposal({
      ...stored,
      accountLinked: true,
      managementToken: undefined,
      alternativeProposal: {
        id: "proposal-id",
        date: "2026-10-08",
        time: "18:00",
        proposedAt: "2026-10-06T04:00:00Z",
      },
    }, "decline");
    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/customer/account/reservations/reservation-id/proposals/proposal-id/decline",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
      }),
    ]);
  });

  it("shows only account reservations when signed in and token-owned guests when signed out", () => {
    const account = { ...stored, id: "account-id", managementToken: undefined, accountLinked: true };
    const otherAccount = { ...account, id: "other-account-id" };

    expect(selectVisibleReservations([stored, otherAccount], [account])).toEqual([account]);
    expect(selectVisibleReservations([stored, otherAccount], null)).toEqual([stored]);
    expect(selectVisibleReservations([stored, otherAccount], undefined)).toEqual([]);
  });

  it("treats an unauthorized account request as a guest session", async () => {
    vi.stubEnv("API_BASE_URL", "");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(null, { status: 401 }),
    ));

    await expect(getAccountReservations()).resolves.toBeNull();
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

  it("issues an account check-in token with CSRF", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(Response.json({
        reservationId: "reservation-id",
        checkInToken: "raw-token",
      }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(issueCustomerCheckInToken({
      ...stored,
      managementToken: undefined,
      accountLinked: true,
    })).resolves.toBe("raw-token");
    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/customer/account/reservations/reservation-id/check-in-token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-CSRF-TOKEN": "csrf-token",
        },
      },
    ]);
  });

  it("issues a guest check-in token with its management token", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const fetchMock = vi.fn().mockResolvedValue(Response.json({
      reservationId: "reservation-id",
      checkInToken: "raw-token",
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(issueCustomerCheckInToken(stored)).resolves.toBe("raw-token");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/customer/reservations/reservation-id/check-in-token",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Reservation-Management-Token": "management-token",
        }),
      }),
    );
  });
});
