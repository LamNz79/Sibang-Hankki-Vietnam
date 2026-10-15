import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createSystemAdminUser,
  getSystemAdminUser,
  updateSystemAdminUser,
} from "./system-admin-directory";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("system admin user CRUD API", () => {
  it("loads a user detail", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const user = { id: "user-1", userid: "customer01", name: "Customer" };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(user));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getSystemAdminUser("user-1")).resolves.toEqual(user);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/users/user-1",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("creates and updates a user with CSRF protection", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const user = { id: "user-1", userid: "customer01", name: "Customer" };
    const csrf = () => Response.json({
      headerName: "X-CSRF-TOKEN",
      parameterName: "_csrf",
      token: "csrf-token",
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(csrf())
      .mockResolvedValueOnce(Response.json(user, { status: 201 }))
      .mockResolvedValueOnce(csrf())
      .mockResolvedValueOnce(Response.json({ ...user, name: "Updated Customer" }));
    vi.stubGlobal("fetch", fetchMock);
    const createInput = {
      userid: "customer01",
      email: "customer@example.com",
      password: "CustomerTest@2026!",
      name: "Customer",
      phone: "0901",
    };
    const updateInput = {
      email: "updated@example.com",
      name: "Updated Customer",
      phone: "0902",
    };

    await createSystemAdminUser(createInput);
    await updateSystemAdminUser("user-1", updateInput);

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/admin/users",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
        body: JSON.stringify(createInput),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "/api/admin/users/user-1",
      expect.objectContaining({ method: "PUT", body: JSON.stringify(updateInput) }),
    );
  });
});
