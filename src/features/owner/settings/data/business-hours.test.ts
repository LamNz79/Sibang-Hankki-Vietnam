import { afterEach, describe, expect, it, vi } from "vitest";
import { updateBusinessHours } from "./business-hours";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("owner business hours API", () => {
  it("updates hours with CSRF protection", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const hours = [{ dayOfWeek: 1, opensAt: "11:30", closesAt: "22:00" }];
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(Response.json({ hours, deletedSlots: 2, generatedSlots: 3 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(updateBusinessHours(hours)).resolves.toMatchObject({ generatedSlots: 3 });
    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/owner/settings/business-hours",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
        body: JSON.stringify({ hours }),
      }),
    ]);
  });
});
