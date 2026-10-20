import { describe, expect, it } from "vitest";
import {
  nextSavedRestaurantSlugs,
  parseSavedRestaurantSlugs,
} from "./use-saved-restaurants";

describe("saved restaurants", () => {
  it("ignores invalid storage and removes duplicate slugs", () => {
    expect(parseSavedRestaurantSlugs("not-json")).toEqual([]);
    expect(parseSavedRestaurantSlugs('["anan-saigon", "anan-saigon", 1, ""]'))
      .toEqual(["anan-saigon"]);
  });

  it("adds and removes a restaurant slug", () => {
    expect(nextSavedRestaurantSlugs([], "anan-saigon")).toEqual(["anan-saigon"]);
    expect(nextSavedRestaurantSlugs(["anan-saigon"], "anan-saigon")).toEqual([]);
  });
});
