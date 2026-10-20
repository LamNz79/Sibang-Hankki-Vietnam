import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

export type LocationProvince = {
  code: number;
  codename: string;
  name: string;
  divisionType: string;
};

export type LocationWard = LocationProvince & {
  provinceCode: number;
};

export type LocationSelection = {
  label: string;
  provinceCode: number;
  wardCode: number | null;
};

export function getLocationProvinces(signal?: AbortSignal) {
  return apiFetch<LocationProvince[]>(apiEndpoints.locationProvinces, {
    cache: "no-store",
    signal,
  });
}

export function getLocationWards(provinceCode: number, signal?: AbortSignal) {
  return apiFetch<LocationWard[]>(apiEndpoints.locationWards(provinceCode), {
    cache: "no-store",
    signal,
  });
}
