import { afterEach, describe, expect, it, vi } from "vitest";
import { getAvailability } from "./availability";

afterEach(() => vi.unstubAllGlobals());

describe("availability API", () => {
  it.each([3, 7, 10, 11])("sends the actual party size %s", async (partySize) => {
    const data = {
      restaurantSlug: "anan-saigon", date: "2026-09-15", partySize,
      slots: partySize <= 6 ? ["19:00"] : [],
      requiresRestaurantConfirmation: partySize > 10,
    };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(data));
    vi.stubGlobal("fetch", fetchMock);
    expect(await getAvailability("anan-saigon", "2026-09-15", partySize)).toEqual(data);
    expect(fetchMock.mock.calls[0][0]).toBe(`/api/restaurants/anan-saigon/availability?date=2026-09-15&partySize=${partySize}`);
  });
  it("does not fall back to mock slots when the backend fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 502 })));
    await expect(getAvailability("anan-saigon", "2026-09-15", 2)).rejects.toThrow("Unable to load");
  });
});
