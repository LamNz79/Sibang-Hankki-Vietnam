import { getCsrfToken } from "@/features/auth/data/session";
import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

export type PublicHeroBanner = {
  title: string | null;
  description: string | null;
  imageUrl: string;
  imageAlt: string | null;
  targetUrl: string;
};

export type PublicCityImage = {
  provinceCode: number;
  citySlug: string;
  imageUrl: string;
  imageAlt: string | null;
  sortOrder: number;
};

export type PublicHomeContent = {
  heroBanner: PublicHeroBanner | null;
  cityImages: PublicCityImage[];
};

export type AdminHeroBanner = {
  titleVi: string | null;
  titleEn: string | null;
  titleKo: string | null;
  descriptionVi: string | null;
  descriptionEn: string | null;
  descriptionKo: string | null;
  imageUrl: string;
  imageAltVi: string | null;
  imageAltEn: string | null;
  imageAltKo: string | null;
  targetUrl: string;
  enabled: boolean;
};

export type AdminCityImage = PublicCityImage & { enabled: boolean };

export type AdminHomeContent = {
  heroBanner: AdminHeroBanner | null;
  cityImages: AdminCityImage[];
};

export function getPublicHomeContent(locale: string, signal?: AbortSignal) {
  return apiFetch<PublicHomeContent>(
    `${apiEndpoints.homeContent}?locale=${encodeURIComponent(locale)}`,
    { cache: "no-store", signal },
  );
}

export function getSystemAdminHomeContent(signal?: AbortSignal) {
  return apiFetch<AdminHomeContent>(apiEndpoints.systemAdminHomeContent, {
    cache: "no-store",
    signal,
  });
}

async function put<T>(path: string, body: unknown) {
  const csrf = await getCsrfToken();
  return apiFetch<T>(path, {
    method: "PUT",
    headers: { [csrf.headerName]: csrf.token },
    body: JSON.stringify(body),
  });
}

export function updateSystemAdminHeroBanner(input: AdminHeroBanner) {
  return put<AdminHeroBanner>(apiEndpoints.systemAdminHomeContentHero, input);
}

export function updateSystemAdminCityImage(input: AdminCityImage) {
  const { provinceCode, ...body } = input;
  return put<AdminCityImage>(
    apiEndpoints.systemAdminHomeContentCity(provinceCode),
    body,
  );
}
