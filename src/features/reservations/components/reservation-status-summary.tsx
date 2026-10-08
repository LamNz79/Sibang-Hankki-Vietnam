"use client";

import { Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import {
  IconCalendarClock,
  IconCheck,
  IconClock,
  IconX,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui";
import {
  getCustomerReservationDisplayStatus,
  getReservationStatusFlags,
} from "@/features/reservations/domain/selectors";
import {
  ReservationCustomerAction,
  VisitStatus,
  type CustomerReservation,
} from "@/features/reservations/types";
import { uiColors } from "@/theme";

type ReservationStatusSummaryProps = {
  reservation: CustomerReservation;
};

/** Maps reservation state to the customer-facing status summary. */
export function ReservationStatusSummary({
  reservation,
}: ReservationStatusSummaryProps) {
  const t = useTranslations("CustomerReservationDetails.status");
  const { isPending, isAlternative, isDeclined, isCancelled } =
    getReservationStatusFlags(reservation);
  const displayStatus = getCustomerReservationDisplayStatus(reservation);
  const visitKey =
    displayStatus === VisitStatus.Arrived
      ? "arrived"
      : displayStatus === VisitStatus.Seated
        ? "seated"
        : displayStatus === VisitStatus.Completed
          ? "completed"
          : displayStatus === VisitStatus.NoShow
            ? "noShow"
            : null;
  const isClosed =
    isDeclined || isCancelled || displayStatus === VisitStatus.NoShow;
  const wasDeclinedByCustomer =
    reservation.customerAction ===
    ReservationCustomerAction.DeclinedAlternative;
  const background = isPending
    ? uiColors.statusWarningSurface
    : isAlternative
      ? uiColors.brandPrimarySubtle
      : isClosed
        ? uiColors.statusErrorSurface
        : uiColors.statusSuccessSurface;
  const borderColor = isPending
    ? uiColors.statusWarningBorder
    : isAlternative
      ? uiColors.brandPrimary
      : isClosed
        ? uiColors.statusErrorText
        : uiColors.statusSuccessText;

  return (
    <Card
      radius="lg"
      p="md"
      style={{
        background,
        border: `1px solid ${borderColor}`,
      }}
    >
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon
          size={44}
          radius="xl"
          variant="light"
          color={
            isPending
              ? "sand"
              : isAlternative
                ? "warmCoral"
                : isClosed
                  ? "red"
                  : "teal"
          }
          style={{ flexShrink: 0 }}
        >
          {isPending ? (
            <IconClock size={22} />
          ) : isAlternative ? (
            <IconCalendarClock size={22} />
          ) : isClosed ? (
            <IconX size={22} />
          ) : (
            <IconCheck size={22} />
          )}
        </ThemeIcon>
        <Stack gap={2}>
          <StatusBadge
            tone={
              isPending
                ? "warning"
                : isAlternative
                  ? "brand"
                  : isClosed
                    ? "error"
                    : "success"
            }
            w="fit-content"
          >
            {visitKey
              ? t(`visit.${visitKey}.badge`)
              : isPending
              ? t("pending.badge")
              : isAlternative
                ? t("alternative.badge")
                : isClosed
                  ? isCancelled
                    ? t("cancelled.badge")
                    : t("declined.badge")
                  : t("confirmed.badge")}
          </StatusBadge>
          <Text fw={800} c={uiColors.textPrimary}>
            {visitKey
              ? t(`visit.${visitKey}.title`)
              : isPending
              ? t("pending.title")
              : isAlternative
                ? t("alternative.title")
              : isClosed
                  ? isCancelled
                    ? t("cancelled.title")
                    : wasDeclinedByCustomer
                    ? t("declined.customerTitle")
                    : t("declined.restaurantTitle")
                  : t("confirmed.title")}
          </Text>
          <Text size="xs" c={uiColors.textSecondary}>
            {visitKey
              ? t(`visit.${visitKey}.description`)
              : isPending
              ? t("pending.description")
              : isAlternative
                ? t("alternative.description")
              : isClosed
                  ? isCancelled
                    ? t("cancelled.description")
                    : wasDeclinedByCustomer
                    ? t("declined.customerDescription")
                    : t("declined.restaurantDescription")
                  : t("confirmed.description")}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}
