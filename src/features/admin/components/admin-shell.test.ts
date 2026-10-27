import { describe, expect, it } from "vitest";
import { getAdminNavigation } from "./admin-shell";

describe("restaurant admin navigation", () => {
  it("keeps content management owner-only", () => {
    expect(getAdminNavigation("STAFF").map(({ href }) => href)).toEqual([
      "/admin",
      "/admin/reservations",
      "/admin/customers",
    ]);
    expect(getAdminNavigation("OWNER").map(({ href }) => href)).toContain("/admin/settings");
  });
});
