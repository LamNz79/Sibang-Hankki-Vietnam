import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getSystemAdminReservation,
  getSystemAdminReservationDisplayStatus,
  getSystemAdminReservations,
} from "./system-admin-reservations";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("system admin reservation API", () => {
  it("requests a filtered reservation page and detail", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const page = { items: [], page: 0, size: 20, totalElements: 0, totalPages: 0 };
    const detail = { id: "reservation-1" };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json(page))
      .mockResolvedValueOnce(Response.json(detail));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getSystemAdminReservations({
      page: 0,
      size: 20,
      query: "Minh",
      restaurantId: "restaurant-1",
      status: "CONFIRMED",
      dateFrom: "2026-10-01",
      dateTo: "2026-10-31",
    })).resolves.toEqual(page);
    await expect(getSystemAdminReservation("reservation-1")).resolves.toEqual(detail);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/admin/reservations?page=0&size=20&query=Minh&restaurantId=restaurant-1&status=CONFIRMED&dateFrom=2026-10-01&dateTo=2026-10-31",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/admin/reservations/reservation-1",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("maps booking and visit states to one display status", () => {
    expect(getSystemAdminReservationDisplayStatus({
      status: "ALTERNATIVE_PROPOSED",
      visitStatus: null,
    })).toBe("PENDING");
    expect(getSystemAdminReservationDisplayStatus({
      status: "CONFIRMED",
      visitStatus: "SEATED",
    })).toBe("CHECKED_IN");
    expect(getSystemAdminReservationDisplayStatus({
      status: "CONFIRMED",
      visitStatus: "COMPLETED",
    })).toBe("COMPLETED");
    expect(getSystemAdminReservationDisplayStatus({
      status: "EXPIRED",
      visitStatus: null,
    })).toBe("DECLINED");
  });
});
