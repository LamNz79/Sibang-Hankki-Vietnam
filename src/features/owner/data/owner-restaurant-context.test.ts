import { afterEach, describe, expect, it, vi } from "vitest";
import { getOwnerRestaurantContext } from "./owner-restaurant-context";

describe("owner restaurant context API", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("reads the minimal restaurant context", async () => {
    const context = {
      restaurantId: "restaurant-1",
      slug: "royal-pavilion",
      name: "The Royal Pavilion",
      timezone: "Asia/Ho_Chi_Minh",
    };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(context));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getOwnerRestaurantContext()).resolves.toEqual(context);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/owner/restaurant-context",
      expect.objectContaining({ cache: "no-store" }),
    );
  });
});
