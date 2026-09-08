export type AdminCampaignStatus = "live" | "scheduled" | "ended";
export type AdminCampaignPlacement =
  | "homeMain"
  | "searchTop"
  | "regionalHome"
  | "storeDetail";
export type AdminCampaignPeriod = "all" | "last30Days" | "next30Days";

export type AdminCampaignRecord = {
  id: string;
  contentKey: "weekendDining" | "hanoiNewOpen" | "chefsChoice";
  status: AdminCampaignStatus;
  placement: AdminCampaignPlacement;
  startOffset: number;
  endOffset: number;
  metrics: readonly [string, string, string];
};

export const adminCampaignRecords: AdminCampaignRecord[] = [
  {
    id: "CAM-DEMO-001",
    contentKey: "weekendDining",
    status: "live",
    placement: "homeMain",
    startOffset: -7,
    endOffset: 7,
    metrics: ["128K", "6.2K", "4.8%"],
  },
  {
    id: "CAM-DEMO-002",
    contentKey: "hanoiNewOpen",
    status: "scheduled",
    placement: "regionalHome",
    startOffset: 15,
    endOffset: 30,
    metrics: ["90K", "Hanoi", "12"],
  },
  {
    id: "CAM-DEMO-003",
    contentKey: "chefsChoice",
    status: "ended",
    placement: "searchTop",
    startOffset: -24,
    endOffset: -10,
    metrics: ["82K", "3.1K", "3.7%"],
  },
];

export function filterAdminCampaigns(
  records: AdminCampaignRecord[],
  placement: AdminCampaignPlacement | "all",
  status: AdminCampaignStatus | "all",
  period: AdminCampaignPeriod,
) {
  return records.filter((campaign) => {
    const matchesPeriod =
      period === "all" ||
      (period === "last30Days"
        ? campaign.startOffset <= 0 && campaign.endOffset >= -30
        : campaign.startOffset <= 30 && campaign.endOffset >= 0);

    return (
      matchesPeriod &&
      (placement === "all" || campaign.placement === placement) &&
      (status === "all" || campaign.status === status)
    );
  });
}
