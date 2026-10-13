import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getSystemAdminRestaurants,
  getSystemAdminUsers,
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
});
