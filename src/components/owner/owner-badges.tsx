import { Badge, Group } from "@mantine/core";
import type {
  GuestTier,
  OwnerReservationStatus,
} from "@/features/owner/mock-data";
import { uiColors } from "@/theme";

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
  const isPending = status === "pending";

  return (
    <Badge
      radius="sm"
      variant="light"
      styles={{
        root: {
          background: isPending
            ? uiColors.statusWarningSurface
            : uiColors.statusSuccessSurface,
          color: isPending
            ? uiColors.statusWarningText
            : uiColors.statusSuccessText,
          textTransform: "none",
          fontWeight: 700,
        },
      }}
    >
      {statusLabels[status]}
    </Badge>
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
        <Badge
          radius="sm"
          variant="light"
          styles={{
            root: {
              background:
                tier === "vip"
                  ? uiColors.brandOrangeSoft
                  : uiColors.surfaceMuted,
              color:
                tier === "vip"
                  ? uiColors.brandOrange
                  : uiColors.textSecondary,
              textTransform: "none",
              fontWeight: 700,
            },
          }}
        >
          {tier === "vip" ? "VIP" : tier === "regular" ? "Regular" : "New"}
        </Badge>
      ) : null}

      {preOrder ? (
        <Badge
          radius="sm"
          variant="light"
          styles={{
            root: {
              background: uiColors.statusInfoSurface,
              color: uiColors.statusInfoText,
              textTransform: "none",
              fontWeight: 700,
            },
          }}
        >
          Pre-order
        </Badge>
      ) : null}
    </Group>
  );
}
