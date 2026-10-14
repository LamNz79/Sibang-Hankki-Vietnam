import { afterEach, describe, expect, it, vi } from "vitest";
import {
  archiveSystemAdminRestaurant,
  createSystemAdminRestaurant,
  getLocationProvinces,
  getLocationWards,
  getSystemAdminRestaurant,
  getSystemAdminRestaurants,
  getSystemAdminUsers,
  updateSystemAdminRestaurant,
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

  it("requests restaurants by province and omits empty filters", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const page = { items: [], page: 0, size: 10, totalElements: 0, totalPages: 0 };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(page));
    vi.stubGlobal("fetch", fetchMock);

    await getSystemAdminRestaurants({
      page: 0,
      size: 10,
      query: "",
      provinceCode: 79,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/restaurants?page=0&size=10&provinceCode=79",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("loads provinces and wards from the location catalog", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const provinces = [{
      code: 79,
      codename: "ho_chi_minh",
      name: "Thành phố Hồ Chí Minh",
      divisionType: "thành phố trung ương",
    }];
    const wards = [{
      code: 27169,
      codename: "phuong_dien_hong",
      name: "Phường Diên Hồng",
      divisionType: "phường",
      provinceCode: 79,
    }];
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json(provinces))
      .mockResolvedValueOnce(Response.json(wards));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getLocationProvinces()).resolves.toEqual(provinces);
    await expect(getLocationWards(79)).resolves.toEqual(wards);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/locations/provinces",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/locations/provinces/79/wards",
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
      provinceCode: 79,
      provinceName: "Thành phố Hồ Chí Minh",
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

  it("reads, creates, updates, and archives a restaurant", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const restaurant = {
      id: "restaurant-1",
      slug: "new-place",
      name: "New Place",
      description: null,
      cuisineType: null,
      cuisineLabel: null,
      citySlug: "ho-chi-minh",
      area: null,
      district: "Phường Diên Hồng",
      provinceCode: 79,
      provinceName: "Thành phố Hồ Chí Minh",
      wardCode: 27169,
      wardName: "Phường Diên Hồng",
      address: null,
      phone: null,
      email: null,
      timezone: "Asia/Ho_Chi_Minh",
      priceRange: null,
      approvalStatus: "DRAFT",
      createdAt: "2026-10-14T08:00:00Z",
      updatedAt: "2026-10-14T08:00:00Z",
    };
    const csrf = Response.json({
      headerName: "X-CSRF-TOKEN",
      parameterName: "_csrf",
      token: "csrf-token",
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json(restaurant))
      .mockResolvedValueOnce(csrf)
      .mockResolvedValueOnce(Response.json(restaurant, { status: 201 }))
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(Response.json({ ...restaurant, name: "Updated Place" }))
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const input = {
      slug: "new-place",
      name: "New Place",
      description: "",
      cuisineType: "",
      cuisineLabel: "",
      provinceCode: 79,
      wardCode: 27169,
      address: "",
      phone: "",
      email: "",
      timezone: "Asia/Ho_Chi_Minh",
      priceRange: "",
    };

    await getSystemAdminRestaurant("restaurant-1");
    await createSystemAdminRestaurant(input);
    await updateSystemAdminRestaurant("restaurant-1", { ...input, name: "Updated Place" });
    await archiveSystemAdminRestaurant("restaurant-1");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/admin/restaurants/restaurant-1",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/admin/restaurants",
      expect.objectContaining({ method: "POST", body: JSON.stringify(input) }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      5,
      "/api/admin/restaurants/restaurant-1",
      expect.objectContaining({ method: "PUT" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      7,
      "/api/admin/restaurants/restaurant-1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
