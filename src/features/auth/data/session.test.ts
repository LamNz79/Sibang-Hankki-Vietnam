import { afterEach, describe, expect, it, vi } from "vitest";
import { login, registerCustomer } from "./session";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("customer registration", () => {
  it("fetches CSRF before posting the customer payload", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const registration = {
      userid: "customer01",
      email: "customer@example.com",
      name: "Customer Name",
      password: " Customer@2026 ",
    };
    const customer = {
      id: "customer-id",
      userid: registration.userid,
      email: registration.email,
      name: registration.name,
      role: "CUSTOMER" as const,
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(Response.json(customer, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(registerCustomer(registration)).resolves.toEqual(customer);
    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/auth/register",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": "csrf-token",
        },
        body: JSON.stringify(registration),
      },
    ]);
  });
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
