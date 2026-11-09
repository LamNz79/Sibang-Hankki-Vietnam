import { afterEach, describe, expect, it, vi } from "vitest";
import { createVnpayCheckout } from "./create-vnpay-checkout";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("create VNPAY checkout API", () => {
  it("sends the guest management token and locale", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const response = {
      paymentId: "payment-id",
      status: "PENDING" as const,
      amount: 100_000,
      currency: "VND" as const,
      expiresAt: "2026-11-05T06:30:00Z",
      checkoutUrl: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?signed=true",
    };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(response));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createVnpayCheckout("reservation-id", "guest-token", "vi"),
    ).resolves.toEqual(response);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/payments/vnpay/reservations/reservation-id?locale=vi",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-Reservation-Management-Token": "guest-token",
        },
      },
    );
  });

  it("uses the authenticated session when no guest token exists", async () => {
    vi.stubEnv("API_BASE_URL", "");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({})));

    await createVnpayCheckout("reservation-id", undefined, "en");

    expect(fetch).toHaveBeenCalledWith(
      "/api/payments/vnpay/reservations/reservation-id?locale=en",
      { method: "POST", headers: { Accept: "application/json" } },
    );
  });
});
