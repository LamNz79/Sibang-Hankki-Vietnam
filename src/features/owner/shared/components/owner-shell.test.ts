import { describe, expect, it } from "vitest";
import { getOwnerNavigation } from "./owner-shell";

describe("owner mobile navigation", () => {
  it("hides settings from staff", () => {
    expect(getOwnerNavigation("STAFF").map(({ href }) => href)).not.toContain("/owner/settings");
    expect(getOwnerNavigation("OWNER").map(({ href }) => href)).toContain("/owner/settings");
  });
});
