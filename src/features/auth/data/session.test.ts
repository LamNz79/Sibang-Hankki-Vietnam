import { afterEach, describe, expect, it, vi } from "vitest";
import { login } from "./session";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("session login", () => {
  it("fetches a CSRF token before submitting credentials", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const user = {
      id: "user-id",
      userid: "owner",
      role: "OWNER" as const,
      restaurantId: "restaurant-id",
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(Response.json(user));
    vi.stubGlobal("fetch", fetchMock);

    await expect(login("owner", "secret-password")).resolves.toEqual(user);
    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/auth/login",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          "X-CSRF-TOKEN": "csrf-token",
        },
        body: new URLSearchParams({
          userid: "owner",
          password: "secret-password",
        }),
      },
    ]);
  });
});
