import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getSystemAdminBookingSettings,
  getSystemAdminBusinessHours,
  regenerateSystemAdminRestaurantSlots,
  updateSystemAdminBookingSettings,
  updateSystemAdminBusinessHours,
  type SystemAdminBookingSettings,
} from "./system-admin-booking-configuration";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const settings: SystemAdminBookingSettings = {
  confirmationMode: "AUTO",
  manualConfirmationMinPartySize: null,
  guestCapacity: 20,
  slotIntervalMinutes: 60,
  diningDurationMinutes: 90,
  bookingWindowDays: 30,
  minimumPartySize: 2,
  maximumOnlinePartySize: 10,
  largePartyThreshold: 11,
  cancellationCutoffMinutes: 120,
  noShowGraceMinutes: 0,
};

describe("system admin booking configuration API", () => {
  it("reads settings and business hours for the selected restaurant", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const hours = [{ dayOfWeek: 1, opensAt: "11:30:00", closesAt: "22:00:00" }];
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json(settings))
      .mockResolvedValueOnce(Response.json(hours));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getSystemAdminBookingSettings("restaurant-1")).resolves.toEqual(settings);
    await expect(getSystemAdminBusinessHours("restaurant-1")).resolves.toEqual(hours);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/admin/restaurants/restaurant-1/booking-settings");
    expect(fetchMock.mock.calls[1][0]).toBe("/api/admin/restaurants/restaurant-1/business-hours");
  });

  it("writes settings, hours, and regeneration with CSRF", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const csrf = () => Response.json({
      headerName: "X-CSRF-TOKEN",
      parameterName: "_csrf",
      token: "csrf-token",
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(csrf()).mockResolvedValueOnce(Response.json(settings))
      .mockResolvedValueOnce(csrf()).mockResolvedValueOnce(Response.json({ hours: [], deletedSlots: 1, generatedSlots: 2 }))
      .mockResolvedValueOnce(csrf()).mockResolvedValueOnce(Response.json({ deletedSlots: 2, generatedSlots: 3 }));
    vi.stubGlobal("fetch", fetchMock);

    await updateSystemAdminBookingSettings("restaurant-1", settings);
    await updateSystemAdminBusinessHours("restaurant-1", []);
    await regenerateSystemAdminRestaurantSlots("restaurant-1");

    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/admin/restaurants/restaurant-1/booking-settings",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
        body: JSON.stringify(settings),
      }),
    ]);
    expect(fetchMock.mock.calls[3][1]).toEqual(expect.objectContaining({
      method: "PUT",
      body: JSON.stringify({ hours: [] }),
    }));
    expect(fetchMock.mock.calls[5][1]).toEqual(expect.objectContaining({ method: "POST" }));
  });
});
