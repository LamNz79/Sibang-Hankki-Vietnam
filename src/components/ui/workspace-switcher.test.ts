import { describe, expect, it } from "vitest";
import { getWorkspace } from "@/components/ui/workspace-switcher";

describe("getWorkspace", () => {
  it("recognizes admin, owner, and customer routes", () => {
    expect(getWorkspace("/admin/reservations")).toBe("admin");
    expect(getWorkspace("/owner/settings")).toBe("owner");
    expect(getWorkspace("/reservations")).toBe("customer");
  });
});
