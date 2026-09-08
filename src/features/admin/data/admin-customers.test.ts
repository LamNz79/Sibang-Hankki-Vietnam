import { describe, expect, it } from "vitest";
import {
  adminCustomerRecords,
  filterAdminCustomers,
} from "@/features/admin/data/admin-customers";

describe("filterAdminCustomers", () => {
  it("combines query, status, and tier filters", () => {
    expect(
      filterAdminCustomers(adminCustomerRecords, "customer c", "active", "vip").map(
        ({ id }) => id,
      ),
    ).toEqual(["CUS-DEMO-003"]);
    expect(filterAdminCustomers(adminCustomerRecords, "", "all", "regular")).toHaveLength(4);
  });
});
