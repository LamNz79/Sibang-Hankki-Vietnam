import { Group } from "@mantine/core";
import { StatusBadge } from "@/components/ui";
import type {
  GuestTier,
  OwnerReservationStatus,
} from "@/features/owner/types";

const statusLabels: Record<OwnerReservationStatus, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  arrived: "Arrived",
  seated: "Seated",
  completed: "Completed",
};

export function ReservationStatusBadge({
  status,
}: {
  status: OwnerReservationStatus;
}) {
  return (
    <StatusBadge tone={status === "pending" ? "warning" : "success"}>
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
