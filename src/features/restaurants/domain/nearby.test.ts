import { describe, expect, it } from "vitest";
import type { RestaurantSummary } from "@/features/restaurants/data/types";
import { filterMappableRestaurants } from "@/features/restaurants/domain/nearby";

const restaurant = {
  slug: "royal-pavilion",
  name: "The Royal Pavilion",
  citySlug: "ho-chi-minh",
  area: "District 1",
  cuisineLabel: "Chinese",
  cuisineKey: "chinese",
  rating: 0,
  heroAccent: "#fff",
  imageUrl: null,
  imageAlt: null,
  availableText: null,
  availableFrom: null,
  priceKey: "over300",
  benefits: [],
  latitude: 10.7756,
  longitude: 106.7039,
} satisfies RestaurantSummary;

describe("nearby restaurants", () => {
  it("keeps only restaurants with valid coordinates", () => {
    expect(filterMappableRestaurants([
      restaurant,
      { ...restaurant, slug: "missing", latitude: null, longitude: null },
    ], "")).toEqual([restaurant]);
  });

  it("searches restaurant name, area, and cuisine", () => {
    expect(filterMappableRestaurants([restaurant], "royal")).toHaveLength(1);
    expect(filterMappableRestaurants([restaurant], "district 1")).toHaveLength(1);
    expect(filterMappableRestaurants([restaurant], "korean")).toHaveLength(0);
  });
});
