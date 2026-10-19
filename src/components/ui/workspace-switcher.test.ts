import { describe, expect, it } from "vitest";
import {
  getAccessibleWorkspaces,
  getWorkspace,
} from "@/components/ui/workspace-switcher";

describe("getWorkspace", () => {
  it("recognizes admin, owner, and customer routes", () => {
    expect(getWorkspace("/admin/reservations")).toBe("admin");
    expect(getWorkspace("/system-admin/users")).toBe("systemAdmin");
    expect(getWorkspace("/owner/settings")).toBe("owner");
    expect(getWorkspace("/reservations")).toBe("customer");
  });
});

describe("getAccessibleWorkspaces", () => {
  it("keeps customer accounts in the customer workspace", () => {
    expect(getAccessibleWorkspaces("CUSTOMER")).toEqual(["customer"]);
  });

  it("shows restaurant workspaces to owners and staff", () => {
    expect(getAccessibleWorkspaces("OWNER")).toEqual([
      "customer",
      "owner",
      "admin",
    ]);
    expect(getAccessibleWorkspaces("STAFF")).toEqual([
      "customer",
      "owner",
      "admin",
    ]);
  });

  it("shows only customer and system administration to admins", () => {
    expect(getAccessibleWorkspaces("ADMIN")).toEqual([
      "customer",
      "systemAdmin",
    ]);
  });

  it("defaults safely when there is no authenticated session", () => {
    expect(getAccessibleWorkspaces(undefined)).toEqual(["customer"]);
  });
});
