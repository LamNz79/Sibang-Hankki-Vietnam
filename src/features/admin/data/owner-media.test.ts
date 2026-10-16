import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createRestaurantImage,
  deleteRestaurantImage,
  getOwnerMedia,
  updateRestaurantImage,
} from "./owner-media";

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

  it("uses the selected restaurant endpoints for system admin media CRUD", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const csrf = {
      headerName: "X-CSRF-TOKEN",
      parameterName: "_csrf",
      token: "csrf-token",
    };
    const fetchMock = vi.fn(async (...[path]: Parameters<typeof fetch>) => (
      path === "/api/auth/csrf"
        ? Response.json(csrf)
        : Response.json({ images: [] })
    ));
    vi.stubGlobal("fetch", fetchMock);
    const image = {
      id: "image-1",
      imageUrl: "https://example.com/restaurant.jpg",
      altText: "Dining room",
      sortOrder: 0,
    };

    await getOwnerMedia(undefined, "restaurant-1");
    await createRestaurantImage(image, "restaurant-1");
    await updateRestaurantImage(image, "restaurant-1");
    await deleteRestaurantImage(image.id, "restaurant-1");

    const apiCalls = fetchMock.mock.calls.filter(([path]) => path !== "/api/auth/csrf");
    expect(apiCalls.map(([path, init]) => [path, init?.method ?? "GET"])).toEqual([
      ["/api/admin/restaurants/restaurant-1/media", "GET"],
      ["/api/admin/restaurants/restaurant-1/media", "POST"],
      ["/api/admin/restaurants/restaurant-1/media/image-1", "PUT"],
      ["/api/admin/restaurants/restaurant-1/media/image-1", "DELETE"],
    ]);
    expect(apiCalls.slice(1).every(([, init]) =>
      new Headers(init?.headers).get("X-CSRF-TOKEN") === "csrf-token")).toBe(true);
  });
});
