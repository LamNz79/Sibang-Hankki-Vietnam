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
import { getReservationStatusFlags } from "@/features/reservations/domain/selectors";
import {
  ReservationCustomerAction,
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
  const { isPending, isAlternative, isDeclined } =
    getReservationStatusFlags(reservation);
  const wasDeclinedByCustomer =
    reservation.customerAction ===
    ReservationCustomerAction.DeclinedAlternative;
  const background = isPending
    ? uiColors.statusWarningSurface
    : isAlternative
      ? uiColors.brandPrimarySubtle
      : isDeclined
        ? uiColors.statusErrorSurface
        : uiColors.statusSuccessSurface;
  const borderColor = isPending
    ? uiColors.statusWarningBorder
    : isAlternative
      ? uiColors.brandPrimary
      : isDeclined
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
                : isDeclined
                  ? "red"
                  : "teal"
          }
          style={{ flexShrink: 0 }}
        >
          {isPending ? (
            <IconClock size={22} />
          ) : isAlternative ? (
            <IconCalendarClock size={22} />
          ) : isDeclined ? (
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
                  : isDeclined
                    ? "error"
                    : "success"
            }
            w="fit-content"
          >
            {isPending
              ? t("pending.badge")
              : isAlternative
                ? t("alternative.badge")
                : isDeclined
                  ? t("declined.badge")
                  : t("confirmed.badge")}
          </StatusBadge>
          <Text fw={800} c={uiColors.textPrimary}>
            {isPending
              ? t("pending.title")
              : isAlternative
                ? t("alternative.title")
              : isDeclined
                  ? wasDeclinedByCustomer
                    ? t("declined.customerTitle")
                    : t("declined.restaurantTitle")
                  : t("confirmed.title")}
          </Text>
          <Text size="xs" c={uiColors.textSecondary}>
            {isPending
              ? t("pending.description")
              : isAlternative
                ? t("alternative.description")
              : isDeclined
                  ? wasDeclinedByCustomer
                    ? t("declined.customerDescription")
                    : t("declined.restaurantDescription")
                  : t("confirmed.description")}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}
