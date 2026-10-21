import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";
import { getRestaurant, getRestaurants } from "@/features/restaurants/data/api";

describe("restaurant API", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("does not replace a network failure with prototype restaurants", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));

    await expect(getRestaurants()).rejects.toThrow("offline");
    await expect(getRestaurant("anan-saigon")).rejects.toThrow("offline");
  });

  it("does not hide an API response error", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })));

    await expect(getRestaurants()).rejects.toBeInstanceOf(ApiError);
  });

  it("returns null only when a restaurant does not exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 404 })),
    );

    await expect(getRestaurant("missing-restaurant")).resolves.toBeNull();
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

  it("sends administrative location filters to the public catalog", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json([]));
    vi.stubGlobal("fetch", fetchMock);

    await getRestaurants({ provinceCode: 79, wardCode: 27169 });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(
        /\/api\/restaurants\?provinceCode=79&wardCode=27169$/,
      ),
      expect.objectContaining({ cache: "no-store" }),
    );
  });
});
