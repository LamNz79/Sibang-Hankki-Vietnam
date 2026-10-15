import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createSystemAdminRestaurantAssignment,
  getSystemAdminRestaurantAssignments,
  removeSystemAdminRestaurantAssignment,
  updateSystemAdminRestaurantAssignment,
} from "./system-admin-directory";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("system admin restaurant assignment API", () => {
  it("lists filtered assignments", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const page = { items: [], page: 0, size: 20, totalElements: 0, totalPages: 0 };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(page));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getSystemAdminRestaurantAssignments({
      page: 0,
      size: 20,
      query: "Lam",
      role: "OWNER",
      restaurantId: "restaurant-1",
    })).resolves.toEqual(page);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/restaurant-assignments?page=0&size=20&query=Lam&role=OWNER&restaurantId=restaurant-1",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("creates, updates, and removes an assignment with CSRF protection", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const assignment = {
      userId: "user-1",
      userid: "owner01",
      name: "Owner",
      email: "owner@example.com",
      userStatus: "ACTIVE",
      role: "OWNER",
      restaurantId: "restaurant-1",
      restaurantSlug: "royal-pavilion",
      restaurantName: "The Royal Pavilion",
      restaurantStatus: "ACTIVE",
    };
    const csrf = () => Response.json({
      headerName: "X-CSRF-TOKEN",
      parameterName: "_csrf",
      token: "csrf-token",
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(csrf())
      .mockResolvedValueOnce(Response.json(assignment, { status: 201 }))
      .mockResolvedValueOnce(csrf())
      .mockResolvedValueOnce(Response.json({ ...assignment, role: "STAFF" }))
      .mockResolvedValueOnce(csrf())
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const input = { userId: "user-1", restaurantId: "restaurant-1", role: "OWNER" as const };

    await createSystemAdminRestaurantAssignment(input);
    await updateSystemAdminRestaurantAssignment("user-1", { ...input, role: "STAFF" });
    await removeSystemAdminRestaurantAssignment("user-1");

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/admin/restaurant-assignments",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
        body: JSON.stringify(input),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "/api/admin/restaurant-assignments/user-1",
      expect.objectContaining({ method: "PUT" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      6,
      "/api/admin/restaurant-assignments/user-1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
