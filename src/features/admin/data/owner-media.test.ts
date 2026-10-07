import { afterEach, describe, expect, it, vi } from "vitest";
import { createRestaurantImage } from "./owner-media";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("owner media API", () => {
  it("creates a restaurant image with CSRF protection", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const image = { imageUrl: "https://example.com/restaurant.jpg", altText: "Dining room", sortOrder: 0 };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(Response.json({ id: "image-id", ...image }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(createRestaurantImage(image)).resolves.toMatchObject({ id: "image-id" });
    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/owner/media",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
        body: JSON.stringify(image),
      }),
    ]);
  });
});
