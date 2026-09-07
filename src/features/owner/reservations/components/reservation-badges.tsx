"use client";

import { Group } from "@mantine/core";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui";
import type { GuestTier } from "@/features/owner/types";
import {
  ReservationStatus,
  type ReservationDisplayStatus,
} from "@/features/reservations/types";

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
  const t = useTranslations("OwnerReservationDetails.badges");

  return (
    <StatusBadge tone={getStatusTone(status)}>
      {t(status)}
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
  const t = useTranslations("OwnerReservationDetails.badges");

  if (!tier && !preOrder) return null;

  return (
    <Group gap={6}>
      {tier ? (
        <StatusBadge tone={tier === "vip" ? "brand" : "neutral"}>
          {t(tier)}
        </StatusBadge>
      ) : null}

      {preOrder ? (
        <StatusBadge tone="info">
          {t("preOrder")}
        </StatusBadge>
      ) : null}
    </Group>
  );
}
