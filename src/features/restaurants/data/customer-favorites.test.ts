import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getCustomerFavorites,
  removeCustomerFavorite,
  saveCustomerFavorite,
} from "@/features/restaurants/data/customer-favorites";

describe("customer favorites API", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("loads the current customer's favorites", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const fetchMock = vi.fn().mockResolvedValue(Response.json([]));
    vi.stubGlobal("fetch", fetchMock);

    await getCustomerFavorites();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/customer/favorites",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it.each([saveCustomerFavorite, removeCustomerFavorite])(
    "sends a CSRF-protected mutation",
    async (mutate) => {
      vi.stubEnv("API_BASE_URL", "");
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(Response.json({
          headerName: "X-CSRF-TOKEN",
          parameterName: "_csrf",
          token: "token",
        }))
        .mockResolvedValueOnce(new Response(null, { status: 204 }));
      vi.stubGlobal("fetch", fetchMock);

      await mutate("royal-pavilion");

      expect(fetchMock).toHaveBeenLastCalledWith(
        "/api/customer/favorites/royal-pavilion",
        expect.objectContaining({
          method: mutate === saveCustomerFavorite ? "PUT" : "DELETE",
          headers: expect.objectContaining({ "X-CSRF-TOKEN": "token" }),
        }),
      );
    },
  );
});
