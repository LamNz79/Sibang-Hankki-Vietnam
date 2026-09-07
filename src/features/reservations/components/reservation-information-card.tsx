"use client";

import { Card, Divider, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import {
  IconCalendarEvent,
  IconMessage,
  IconToolsKitchen3,
  IconUsers,
} from "@tabler/icons-react";
import { useFormatter, useTranslations } from "next-intl";
import type { CustomerReservation } from "@/features/reservations/types";
import { uiColors } from "@/theme";

type DetailRowProps = {
  icon: typeof IconCalendarEvent;
  label: string;
  value: string;
  iconBackground: string;
  iconColor: string;
};

type ReservationInformationCardProps = {
  reservation: CustomerReservation;
};

/** Renders one labeled reservation detail with a semantic icon treatment. */
function DetailRow({
  icon: Icon,
  label,
  value,
  iconBackground,
  iconColor,
}: DetailRowProps) {
  return (
    <Group gap="sm" wrap="nowrap" py="sm">
      <ThemeIcon
        size={34}
        radius="md"
        variant="filled"
        style={{
          flexShrink: 0,
          background: iconBackground,
          color: iconColor,
        }}
      >
        <Icon size={17} />
      </ThemeIcon>
      <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
        <Text size="xs" c={uiColors.textSecondary}>
          {label}
        </Text>
        <Text size="sm" fw={700} c={uiColors.textPrimary}>
          {value}
        </Text>
      </Stack>
    </Group>
  );
}

/** Displays the requested date, party, pre-order, and special request. */
export function ReservationInformationCard({
  reservation,
}: ReservationInformationCardProps) {
  const format = useFormatter();
  const t = useTranslations("CustomerReservationDetails.information");

  return (
    <Card
      radius="lg"
      px="md"
      py={0}
      style={{
        border: `1px solid ${uiColors.border}`,
        background: uiColors.surface,
      }}
    >
      <DetailRow
        icon={IconCalendarEvent}
        label={t("date")}
        value={format.dateTime(new Date(`${reservation.date}T00:00:00`), {
          weekday: "long",
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
        iconBackground={uiColors.detailDateSurface}
        iconColor={uiColors.detailDateText}
      />
      <Divider color={uiColors.border} />
      <DetailRow
        icon={IconUsers}
        label={t("timeGuests")}
        value={`${reservation.time} · ${t("guestCount", { count: reservation.guests })}`}
        iconBackground={uiColors.detailGuestsSurface}
        iconColor={uiColors.detailGuestsText}
      />
      <Divider color={uiColors.border} />
      <DetailRow
        icon={IconToolsKitchen3}
        label={t("preOrder")}
        value={reservation.preOrder ?? t("noPreOrder")}
        iconBackground={uiColors.detailPreOrderSurface}
        iconColor={uiColors.detailPreOrderText}
      />
      <Divider color={uiColors.border} />
      <DetailRow
        icon={IconMessage}
        label={t("request")}
        value={reservation.specialRequest ?? t("noRequest")}
        iconBackground={uiColors.detailRequestSurface}
        iconColor={uiColors.detailRequestText}
      />
    </Card>
  );
}
