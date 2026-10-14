import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getSystemAdminRestaurants,
  getSystemAdminUsers,
  updateSystemAdminRestaurantStatus,
  updateSystemAdminUserStatus,
} from "./system-admin-directory";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("system admin directory API", () => {
  it("requests a filtered user page", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const page = { items: [], page: 1, size: 20, totalElements: 0, totalPages: 0 };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(page));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getSystemAdminUsers({
      page: 1,
      size: 20,
      query: "Minh",
      role: "CUSTOMER",
      status: "ACTIVE",
    })).resolves.toEqual(page);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/users?page=1&size=20&query=Minh&role=CUSTOMER&status=ACTIVE",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("omits empty restaurant filters", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const page = { items: [], page: 0, size: 10, totalElements: 0, totalPages: 0 };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(page));
    vi.stubGlobal("fetch", fetchMock);

    await getSystemAdminRestaurants({ page: 0, size: 10, query: "" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/restaurants?page=0&size=10",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("updates a user status with CSRF protection", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const user = {
      id: "user-1",
      userid: "customer",
      email: null,
      name: "Customer",
      phone: null,
      role: "CUSTOMER",
      status: "SUSPENDED",
      restaurantId: null,
      statusChangedAt: "2026-10-13T08:00:00Z",
      createdAt: "2026-10-01T08:00:00Z",
      updatedAt: "2026-10-13T08:00:00Z",
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(Response.json(user));
    vi.stubGlobal("fetch", fetchMock);

    await expect(updateSystemAdminUserStatus("user-1", "SUSPENDED"))
      .resolves.toEqual(user);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/admin/users/user-1/status",
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
        body: JSON.stringify({ status: "SUSPENDED" }),
      }),
    );
  });

  it("updates a restaurant status with CSRF protection", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const restaurant = {
      id: "restaurant-1",
      slug: "royal-pavilion",
      name: "The Royal Pavilion",
      citySlug: "ho-chi-minh",
      area: null,
      district: null,
      approvalStatus: "ACTIVE",
      createdAt: "2026-10-01T08:00:00Z",
      updatedAt: "2026-10-13T08:00:00Z",
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(Response.json(restaurant));
    vi.stubGlobal("fetch", fetchMock);

    await expect(updateSystemAdminRestaurantStatus("restaurant-1", "ACTIVE"))
      .resolves.toEqual(restaurant);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/admin/restaurants/restaurant-1/status",
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
        body: JSON.stringify({ status: "ACTIVE" }),
      }),
    );
  });
});
