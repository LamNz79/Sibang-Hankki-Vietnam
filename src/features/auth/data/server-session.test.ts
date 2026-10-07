import { describe, expect, it } from "vitest";
import { canAccessRestaurantWorkspace } from "./server-session";

describe("restaurant workspace access", () => {
  it("allows restaurant roles only", () => {
    expect(canAccessRestaurantWorkspace("OWNER")).toBe(true);
    expect(canAccessRestaurantWorkspace("STAFF")).toBe(true);
    expect(canAccessRestaurantWorkspace("CUSTOMER")).toBe(false);
    expect(canAccessRestaurantWorkspace("ADMIN")).toBe(false);
  });
});
