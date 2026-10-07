import { afterEach, describe, expect, it, vi } from "vitest";
import { getCustomerProfile, updateCustomerProfile } from "./customer-profile";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("customer profile API", () => {
  it("reads the authenticated profile", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const profile = {
      id: "customer-id",
      userid: "customer01",
      name: "Customer Name",
      email: "customer@example.com",
      phone: null,
    };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(profile));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCustomerProfile()).resolves.toEqual(profile);
    expect(fetchMock).toHaveBeenCalledWith("/api/customer/profile", {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: undefined,
    });
  });

  it("gets CSRF before updating editable fields", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const update = { name: "New Name", email: "new@example.com", phone: "0900000000" };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(Response.json({ id: "id", userid: "customer01", ...update }));
    vi.stubGlobal("fetch", fetchMock);

    await updateCustomerProfile(update);
    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/customer/profile",
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": "csrf-token",
        },
        body: JSON.stringify(update),
      },
    ]);
  });
});
