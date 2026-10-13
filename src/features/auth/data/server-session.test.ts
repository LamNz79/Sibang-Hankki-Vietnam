import { describe, expect, it } from "vitest";
import {
  canAccessRestaurantWorkspace,
  canAccessSystemAdmin,
} from "./server-session";

describe("restaurant workspace access", () => {
  it("allows restaurant roles only", () => {
    expect(canAccessRestaurantWorkspace("OWNER")).toBe(true);
    expect(canAccessRestaurantWorkspace("STAFF")).toBe(true);
    expect(canAccessRestaurantWorkspace("CUSTOMER")).toBe(false);
    expect(canAccessRestaurantWorkspace("ADMIN")).toBe(false);
  });

  it("allows only ADMIN into the system workspace", () => {
    expect(canAccessSystemAdmin("ADMIN")).toBe(true);
    expect(canAccessSystemAdmin("OWNER")).toBe(false);
    expect(canAccessSystemAdmin("STAFF")).toBe(false);
    expect(canAccessSystemAdmin("CUSTOMER")).toBe(false);
  });
});
