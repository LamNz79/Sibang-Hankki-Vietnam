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
    expect(restaurants[0]).not.toHaveProperty("menuCategories");
    expect(restaurants[0].imageUrl).toContain("images.unsplash.com");
    expect(restaurant?.name).toBe("Anan Saigon");
  });

  it("does not hide an API response error", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })));

    await expect(getRestaurants()).rejects.toBeInstanceOf(ApiError);
  });

  it("loads a restaurant created outside the prototype data", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const liveRestaurant = {
      slug: "new-live-restaurant",
      name: "New Live Restaurant",
    };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(liveRestaurant));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getRestaurant(liveRestaurant.slug)).resolves.toEqual(
      liveRestaurant,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/restaurants/${liveRestaurant.slug}`,
      expect.objectContaining({ cache: "no-store" }),
    );
  });
});
