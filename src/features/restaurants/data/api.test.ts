import { afterEach, describe, expect, it, vi } from "vitest";
import { getRestaurant, getRestaurants } from "@/features/restaurants/data/api";

describe("restaurant API development fallback", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses prototype data when the API is unavailable in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const restaurants = await getRestaurants();
    const restaurant = await getRestaurant("anan-saigon");

    expect(restaurants[0]).not.toHaveProperty("slotMatrix");
    expect(restaurant?.name).toBe("Anan Saigon");
  });
});
