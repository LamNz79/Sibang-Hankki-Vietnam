export type GeoPoint = {
  latitude: number;
  longitude: number;
};

export type LocationErrorKey =
  | "locationDenied"
  | "locationTimeout"
  | "locationUnavailable";

const EARTH_RADIUS_KM = 6_371;

const toRadians = (degrees: number) => degrees * (Math.PI / 180);

export function isGeoPoint(value: {
  latitude?: number | null;
  longitude?: number | null;
}): value is GeoPoint {
  return typeof value.latitude === "number"
    && Number.isFinite(value.latitude)
    && value.latitude >= -90
    && value.latitude <= 90
    && typeof value.longitude === "number"
    && Number.isFinite(value.longitude)
    && value.longitude >= -180
    && value.longitude <= 180;
}

export function distanceInKilometers(from: GeoPoint, to: GeoPoint) {
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(fromLatitude)
    * Math.cos(toLatitude)
    * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(haversine));
}

export function getLocationErrorKey(code: number): LocationErrorKey {
  if (code === 1) return "locationDenied";
  if (code === 3) return "locationTimeout";
  return "locationUnavailable";
}

export function googleMapsDirectionsUrl(destination: {
  name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  googlePlaceId?: string | null;
}) {
  const search = new URLSearchParams({ api: "1" });
  search.set(
    "destination",
    isGeoPoint(destination)
      ? `${destination.latitude},${destination.longitude}`
      : `${destination.name}, ${destination.address}`,
  );
  if (destination.googlePlaceId) {
    search.set("destination_place_id", destination.googlePlaceId);
  }

  return `https://www.google.com/maps/dir/?${search.toString()}`;
}
