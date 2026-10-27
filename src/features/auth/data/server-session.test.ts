import { describe, expect, it } from "vitest";
import {
  canAccessRestaurantWorkspace,
  canAccessSystemAdmin,
  canManageRestaurant,
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

  it("allows only OWNER to manage restaurant configuration", () => {
    expect(canManageRestaurant("OWNER")).toBe(true);
    expect(canManageRestaurant("STAFF")).toBe(false);
    expect(canManageRestaurant("CUSTOMER")).toBe(false);
    expect(canManageRestaurant("ADMIN")).toBe(false);
  });
});
