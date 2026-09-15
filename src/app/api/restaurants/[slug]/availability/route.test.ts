import { afterEach, expect, it, vi } from "vitest";
import { GET } from "./route";

afterEach(() => vi.unstubAllGlobals());

it("forwards query parameters and backend status without caching", async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ error: "Bad Request" }, { status: 400 }));
  vi.stubGlobal("fetch", fetchMock);
  const response = await GET(new Request("http://localhost:3000/api/restaurants/anan-saigon/availability?date=bad&partySize=3"), {
    params: Promise.resolve({ slug: "anan-saigon" }),
  });
  const url = fetchMock.mock.calls[0][0] as URL;
  expect(url.pathname).toBe("/api/restaurants/anan-saigon/availability");
  expect(url.search).toBe("?date=bad&partySize=3");
  expect(response.status).toBe(400);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
});
it("returns 502 when the backend cannot be reached", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  const response = await GET(new Request("http://localhost:3000/api/restaurants/anan-saigon/availability"), {
    params: Promise.resolve({ slug: "anan-saigon" }),
  });
  expect(response.status).toBe(502);
});
