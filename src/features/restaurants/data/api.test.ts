import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";
import { getRestaurant, getRestaurants } from "@/features/restaurants/data/api";

describe("restaurant API development fallback", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses prototype data when the API is unavailable in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const restaurants = await getRestaurants();
    const restaurant = await getRestaurant("anan-saigon");

    expect(restaurants[0]).not.toHaveProperty("slotMatrix");
    expect(restaurants[0].imageUrl).toContain("images.unsplash.com");
    expect(restaurant?.name).toBe("Anan Saigon");
  });

  it("does not hide an API response error", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })));

    await expect(getRestaurants()).rejects.toBeInstanceOf(ApiError);
  });
});
