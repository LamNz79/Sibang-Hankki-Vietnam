import { afterEach, describe, expect, it, vi } from "vitest";
import { updateOwnerSettings, type OwnerSettingsUpdate } from "./owner-settings";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("owner settings API", () => {
  it("updates settings with the session CSRF token", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const update = settingsUpdate();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(Response.json({
        restaurantId: "restaurant-id",
        slug: "royal-pavilion",
        citySlug: "ho-chi-minh-city",
        timezone: "Asia/Ho_Chi_Minh",
        ...update,
      }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(updateOwnerSettings(update)).resolves.toMatchObject({
      restaurantId: "restaurant-id",
      guestCapacity: 48,
    });
    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/owner/settings",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
        body: JSON.stringify(update),
      }),
    ]);
  });
});

function settingsUpdate(): OwnerSettingsUpdate {
  return {
    name: "The Royal Pavilion",
    description: null,
    cuisineLabel: "Chinese",
    area: "District 1",
    district: "District 1",
    address: null,
    phone: null,
    email: null,
    priceRange: "$$$",
    guestCapacity: 48,
    bookingIntervalMinutes: 30,
    diningDurationMinutes: 90,
    confirmationMode: "AUTO",
    manualConfirmationMinPartySize: null,
    bookingWindowDays: 30,
    minimumPartySize: 1,
    maximumOnlinePartySize: 6,
    largePartyThreshold: 10,
    customerCancellationCutoffMinutes: 120,
  };
}
