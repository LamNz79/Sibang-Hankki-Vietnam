import { afterEach, describe, expect, it, vi } from "vitest";
import { createItem, type ItemInput } from "./owner-menu";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("owner menu API", () => {
  it("creates a restaurant menu item with CSRF protection", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const item: ItemInput = {
      categoryId: "category-id",
      name: "Phở bò",
      description: null,
      price: 80000,
      currency: "VND",
      imageUrl: null,
      available: true,
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(Response.json({ id: "item-id", ...item }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(createItem(item)).resolves.toMatchObject({ id: "item-id" });
    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/owner/menu/items",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
        body: JSON.stringify(item),
      }),
    ]);
  });
});
