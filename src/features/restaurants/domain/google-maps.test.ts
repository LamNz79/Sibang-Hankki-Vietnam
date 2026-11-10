import { describe, expect, it } from "vitest";
import { googleMapsDirectionsUrl } from "@/features/restaurants/domain/google-maps";

describe("googleMapsDirectionsUrl", () => {
  it("builds a Google Maps directions URL from the restaurant name and address", () => {
    const url = new URL(googleMapsDirectionsUrl({
      name: "The Royal Pavilion",
      address: "39 Le Duan, District 1, Ho Chi Minh City",
    }));

    expect(`${url.origin}${url.pathname}`).toBe("https://www.google.com/maps/dir/");
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("destination")).toBe(
      "The Royal Pavilion, 39 Le Duan, District 1, Ho Chi Minh City",
    );
  });
});
