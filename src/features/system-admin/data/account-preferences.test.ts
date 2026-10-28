import { afterEach, describe, expect, it, vi } from "vitest";
import {
  defaultAccountPreferences,
  getAccountPreferences,
  resetAccountPreferences,
  updateAccountPreferences,
} from "./account-preferences";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("account preferences API", () => {
  it("reads the authenticated account preferences", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const fetchMock = vi.fn().mockResolvedValue(Response.json(defaultAccountPreferences));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getAccountPreferences()).resolves.toEqual(defaultAccountPreferences);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/account/preferences",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("updates and resets preferences with CSRF", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const csrf = () => Response.json({
      headerName: "X-CSRF-TOKEN",
      parameterName: "_csrf",
      token: "csrf-token",
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(csrf())
      .mockResolvedValueOnce(Response.json(defaultAccountPreferences))
      .mockResolvedValueOnce(csrf())
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await updateAccountPreferences(defaultAccountPreferences);
    await resetAccountPreferences();

    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/account/preferences",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
        body: JSON.stringify(defaultAccountPreferences),
      }),
    ]);
    expect(fetchMock.mock.calls[3]).toEqual([
      "/api/account/preferences",
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
      }),
    ]);
  });

  it("sends Korean as a supported account locale", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const koreanPreferences = { ...defaultAccountPreferences, locale: "ko" as const };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
        token: "csrf-token",
      }))
      .mockResolvedValueOnce(Response.json(koreanPreferences));
    vi.stubGlobal("fetch", fetchMock);

    await expect(updateAccountPreferences(koreanPreferences)).resolves.toEqual(koreanPreferences);
    expect(fetchMock.mock.calls[1][1]).toEqual(expect.objectContaining({
      body: JSON.stringify(koreanPreferences),
    }));
  });
});
