import { describe, expect, it } from "vitest";
import {
  distanceInKilometers,
  googleMapsDirectionsUrl,
  isGeoPoint,
} from "@/features/restaurants/domain/location";

describe("restaurant location", () => {
  it("validates coordinates", () => {
    expect(isGeoPoint({ latitude: 10.7769, longitude: 106.7009 })).toBe(true);
    expect(isGeoPoint({ latitude: 91, longitude: 106.7009 })).toBe(false);
    expect(isGeoPoint({ latitude: null, longitude: null })).toBe(false);
  });

  it("calculates the distance between two points", () => {
    const distance = distanceInKilometers(
      { latitude: 10.7769, longitude: 106.7009 },
      { latitude: 10.7826, longitude: 106.6958 },
    );

    expect(distance).toBeGreaterThan(0.8);
    expect(distance).toBeLessThan(0.9);
  });

  it("builds directions with coordinates and a Google place ID", () => {
    const url = new URL(googleMapsDirectionsUrl({
      name: "Test restaurant",
      address: "Ho Chi Minh City",
      latitude: 10.7769,
      longitude: 106.7009,
      googlePlaceId: "place-123",
    }));

    expect(url.origin + url.pathname).toBe("https://www.google.com/maps/dir/");
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("destination")).toBe("10.7769,106.7009");
    expect(url.searchParams.get("destination_place_id")).toBe("place-123");
  });

  it("falls back to the restaurant name and address", () => {
    const url = new URL(googleMapsDirectionsUrl({
      name: "Test restaurant",
      address: "1 Example Street",
    }));

    expect(url.searchParams.get("destination")).toBe(
      "Test restaurant, 1 Example Street",
    );
  });
});
