import { afterEach, expect, it, vi } from "vitest";
import { POST } from "./route";

afterEach(() => vi.unstubAllGlobals());

it("forwards the customer session and idempotency key", async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ id: "reservation-id" }));
  vi.stubGlobal("fetch", fetchMock);
  const response = await POST(new Request("http://localhost:3000/api/reservations", {
    method: "POST",
    headers: {
      cookie: "JSESSIONID=customer-session",
      "Idempotency-Key": "request-1",
    },
    body: JSON.stringify({ restaurantSlug: "royal-pavilion" }),
  }));

  expect(response.status).toBe(200);
  expect(fetchMock).toHaveBeenCalledWith(
    expect.any(URL),
    expect.objectContaining({
      headers: expect.objectContaining({
        cookie: "JSESSIONID=customer-session",
        "Idempotency-Key": "request-1",
      }),
    }),
  );
});
