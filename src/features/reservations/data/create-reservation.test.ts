import { afterEach, describe, expect, it, vi } from "vitest";
import { createReservation } from "./create-reservation";

afterEach(() => vi.unstubAllGlobals());

describe("create reservation API", () => {
  it("sends the backend contract and idempotency key", async () => {
    const response = {
      id: "reservation-id",
      reference: "SHK-123",
      restaurantSlug: "anan-saigon",
      date: "2026-10-05",
      time: "18:30",
      partySize: 2,
      status: "CONFIRMED" as const,
      requiresRestaurantConfirmation: false,
      createdAt: "2026-10-02T00:00:00Z",
    };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(response));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createReservation({
        idempotencyKey: "request-1",
        restaurantSlug: "anan-saigon",
        date: "2026-10-05",
        time: "18:30",
        partySize: 2,
        customerName: "Minh Lam",
        customerPhone: "0900000000",
      }),
    ).resolves.toEqual(response);

    expect(fetchMock).toHaveBeenCalledWith("/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": "request-1",
      },
      body: JSON.stringify({
        restaurantSlug: "anan-saigon",
        date: "2026-10-05",
        time: "18:30",
        partySize: 2,
        customerName: "Minh Lam",
        customerPhone: "0900000000",
      }),
    });
  });

  it("explains a capacity conflict", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 409 })),
    );

    await expect(
      createReservation({
        idempotencyKey: "request-1",
        restaurantSlug: "anan-saigon",
        date: "2026-10-05",
        time: "18:30",
        partySize: 2,
        customerName: "Minh Lam",
        customerPhone: "0900000000",
      }),
    ).rejects.toThrow("no longer available");
  });
});
