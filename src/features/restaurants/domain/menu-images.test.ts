import { describe, expect, it } from "vitest";
import { menuItemImageUrl } from "@/features/restaurants/domain/menu-images";

describe("menu item images", () => {
  it("prefers the image supplied by the backend", () => {
    expect(menuItemImageUrl({ name: "Har Gow", imageUrl: "/custom.jpg" }))
      .toBe("/custom.jpg");
  });

  it("uses the bundled image for a known sample dish", () => {
    expect(menuItemImageUrl({ name: "Har Gow", imageUrl: null }))
      .toBe("/images/sample/food/har-gow.jpg");
  });

  it("does not invent an image for an unknown dish", () => {
    expect(menuItemImageUrl({ name: "Seasonal soup", imageUrl: null })).toBeNull();
  });
});
