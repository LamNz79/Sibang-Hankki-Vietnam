import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createCategory,
  createItem,
  deleteCategory,
  deleteItem,
  getOwnerMenu,
  updateCategory,
  updateItem,
  type ItemInput,
} from "./owner-menu";

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

  it("uses the selected restaurant endpoints for system admin menu CRUD", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const csrf = {
      headerName: "X-CSRF-TOKEN",
      parameterName: "_csrf",
      token: "csrf-token",
    };
    const fetchMock = vi.fn(async (...[path]: Parameters<typeof fetch>) => (
      path === "/api/auth/csrf"
        ? Response.json(csrf)
        : Response.json({ categories: [], items: [] })
    ));
    vi.stubGlobal("fetch", fetchMock);
    const category = { id: "category-1", name: "Main dishes", displayOrder: 0 };
    const item = {
      id: "item-1",
      categoryId: category.id,
      name: "Grilled beef",
      description: null,
      price: 250000,
      currency: "VND",
      imageUrl: null,
      available: true,
    };

    await getOwnerMenu(undefined, "restaurant-1");
    await createCategory(category, "restaurant-1");
    await updateCategory(category, "restaurant-1");
    await deleteCategory(category.id, "restaurant-1");
    await createItem(item, "restaurant-1");
    await updateItem(item, "restaurant-1");
    await deleteItem(item.id, "restaurant-1");

    const apiCalls = fetchMock.mock.calls.filter(([path]) => path !== "/api/auth/csrf");
    expect(apiCalls.map(([path, init]) => [path, init?.method ?? "GET"])).toEqual([
      ["/api/admin/restaurants/restaurant-1/menu", "GET"],
      ["/api/admin/restaurants/restaurant-1/menu/categories", "POST"],
      ["/api/admin/restaurants/restaurant-1/menu/categories/category-1", "PUT"],
      ["/api/admin/restaurants/restaurant-1/menu/categories/category-1", "DELETE"],
      ["/api/admin/restaurants/restaurant-1/menu/items", "POST"],
      ["/api/admin/restaurants/restaurant-1/menu/items/item-1", "PUT"],
      ["/api/admin/restaurants/restaurant-1/menu/items/item-1", "DELETE"],
    ]);
    expect(apiCalls.slice(1).every(([, init]) =>
      new Headers(init?.headers).get("X-CSRF-TOKEN") === "csrf-token")).toBe(true);
  });
});
