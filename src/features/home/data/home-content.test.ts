import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getPublicHomeContent,
  getSystemAdminHomeContent,
  updateSystemAdminCityImage,
  updateSystemAdminHeroBanner,
  type AdminCityImage,
  type AdminHeroBanner,
} from "./home-content";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("home content API", () => {
  it("loads localized public and admin content", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const content = { heroBanner: null, cityImages: [] };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json(content))
      .mockResolvedValueOnce(Response.json(content));
    vi.stubGlobal("fetch", fetchMock);

    await getPublicHomeContent("ko");
    await getSystemAdminHomeContent();

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/home-content?locale=ko",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/admin/home-content",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("updates hero and city with CSRF protection", async () => {
    vi.stubEnv("API_BASE_URL", "");
    const hero: AdminHeroBanner = {
      titleVi: "Tiêu đề",
      titleEn: "Title",
      titleKo: "제목",
      descriptionVi: null,
      descriptionEn: null,
      descriptionKo: null,
      imageUrl: "/images/hero.jpg",
      imageAltVi: null,
      imageAltEn: null,
      imageAltKo: null,
      targetUrl: "/restaurants/royal-pavilion",
      enabled: true,
    };
    const city: AdminCityImage = {
      provinceCode: 79,
      citySlug: "ho-chi-minh",
      imageUrl: "/images/city.jpg",
      imageAlt: "Ho Chi Minh City",
      sortOrder: 1,
      enabled: true,
    };
    const csrf = {
      headerName: "X-CSRF-TOKEN",
      parameterName: "_csrf",
      token: "csrf-token",
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json(csrf))
      .mockResolvedValueOnce(Response.json(hero))
      .mockResolvedValueOnce(Response.json(csrf))
      .mockResolvedValueOnce(Response.json(city));
    vi.stubGlobal("fetch", fetchMock);

    await updateSystemAdminHeroBanner(hero);
    await updateSystemAdminCityImage(city);

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/admin/home-content/hero",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
        body: JSON.stringify(hero),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "/api/admin/home-content/cities/79",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          citySlug: "ho-chi-minh",
          imageUrl: "/images/city.jpg",
          imageAlt: "Ho Chi Minh City",
          sortOrder: 1,
          enabled: true,
        }),
      }),
    );
  });
});
