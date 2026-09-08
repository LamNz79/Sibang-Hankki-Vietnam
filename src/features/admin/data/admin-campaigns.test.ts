import { describe, expect, it } from "vitest";
import {
  adminCampaignRecords,
  filterAdminCampaigns,
} from "@/features/admin/data/admin-campaigns";

describe("filterAdminCampaigns", () => {
  it("combines placement, status, and period filters", () => {
    expect(
      filterAdminCampaigns(
        adminCampaignRecords,
        "regionalHome",
        "scheduled",
        "next30Days",
      ).map(({ id }) => id),
    ).toEqual(["CAM-DEMO-002"]);
    expect(
      filterAdminCampaigns(adminCampaignRecords, "all", "all", "last30Days"),
    ).toHaveLength(2);
  });
});
