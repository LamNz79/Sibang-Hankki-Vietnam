import { describe, expect, it } from "vitest";
import {
  matchesCitySlug,
  normalizeCitySlug,
} from "@/features/restaurants/domain/city";

describe("restaurant city slugs", () => {
  it("normalizes the legacy Ho Chi Minh City slug", () => {
    expect(normalizeCitySlug("ho-chi-minh-city")).toBe("ho-chi-minh");
  });

  it("matches legacy seed data with the current province API codename", () => {
    expect(matchesCitySlug("ho-chi-minh-city", "ho-chi-minh")).toBe(true);
    expect(matchesCitySlug("ho-chi-minh", "ho-chi-minh-city")).toBe(true);
  });

  it("does not merge different cities", () => {
    expect(matchesCitySlug("hanoi", "da-nang")).toBe(false);
  });
});
