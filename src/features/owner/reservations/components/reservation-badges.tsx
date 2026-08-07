import { Group } from "@mantine/core";
import { StatusBadge } from "@/components/ui";
import type { GuestTier } from "@/features/owner/types";
import {
  ReservationStatus,
  VisitStatus,
  type ReservationDisplayStatus,
} from "@/features/reservations/types";

const statusLabels: Record<ReservationDisplayStatus, string> = {
  [ReservationStatus.Pending]: "Pending",
  [ReservationStatus.AlternativeProposed]: "Alternative proposed",
  [ReservationStatus.Confirmed]: "Confirmed",
  [ReservationStatus.Declined]: "Declined",
  [VisitStatus.Expected]: "Expected",
  [VisitStatus.Arrived]: "Arrived",
  [VisitStatus.Seated]: "Seated",
  [VisitStatus.Completed]: "Completed",
};

function getStatusTone(status: ReservationDisplayStatus) {
  if (
    status === ReservationStatus.Pending ||
    status === ReservationStatus.AlternativeProposed
  ) {
    return "warning" as const;
  }

  if (status === ReservationStatus.Declined) return "error" as const;
  return "success" as const;
}

export function ReservationStatusBadge({
  status,
}: {
  status: ReservationDisplayStatus;
}) {
  return (
    <StatusBadge tone={getStatusTone(status)}>
      {statusLabels[status]}
    </StatusBadge>
  );
}

export function GuestContextBadges({
  tier,
  preOrder,
}: {
  tier?: GuestTier;
  preOrder?: boolean;
}) {
  if (!tier && !preOrder) return null;

  return (
    <Group gap={6}>
      {tier ? (
        <StatusBadge tone={tier === "vip" ? "brand" : "neutral"}>
          {tier === "vip" ? "VIP" : tier === "regular" ? "Regular" : "New"}
        </StatusBadge>
      ) : null}

      {preOrder ? (
        <StatusBadge tone="info">
          Pre-order
        </StatusBadge>
      ) : null}
    </Group>
  );
}
