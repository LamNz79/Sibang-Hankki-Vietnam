import { describe, expect, it } from "vitest";
import {
  adminStoreRecords,
  filterAdminStores,
} from "@/features/admin/data/admin-stores";

describe("filterAdminStores", () => {
  it("combines query, status, and region filters", () => {
    expect(
      filterAdminStores(adminStoreRecords, "table", "active", "daNang").map(
        ({ id }) => id,
      ),
    ).toEqual(["STORE-DEMO-003"]);
    expect(filterAdminStores(adminStoreRecords, "", "all", "hanoi")).toHaveLength(2);
  });
});
