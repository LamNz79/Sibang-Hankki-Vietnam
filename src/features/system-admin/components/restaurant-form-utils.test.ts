import { describe, expect, it } from "vitest";
import { normalizeRestaurantSlugInput } from "./restaurant-form-utils";

describe("normalizeRestaurantSlugInput", () => {
  it("converts Vietnamese names into URL-safe slugs", () => {
    expect(normalizeRestaurantSlugInput("Nhà hàng của Lâm"))
      .toBe("nha-hang-cua-lam");
  });

  it("keeps a trailing separator while the user is typing", () => {
    expect(normalizeRestaurantSlugInput("Nhà hàng ")).toBe("nha-hang-");
  });
});
