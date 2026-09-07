"use client";

import { Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import {
  IconCalendarClock,
  IconCircleCheck,
  IconMessageCircle,
  IconX,
} from "@tabler/icons-react";
import { useFormatter, useTranslations } from "next-intl";
import type {
  OwnerCustomerResponse,
  OwnerReservation,
} from "@/features/owner/types";
import { uiColors } from "@/theme";

function useResponseContent(
  response: OwnerCustomerResponse,
  reservation: OwnerReservation,
) {
  const format = useFormatter();
  const t = useTranslations("OwnerReservationDetails.customerResponse");
  const formatDate = (date: string) =>
    format.dateTime(new Date(`${date}T00:00:00`), {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  if (response.kind === "accepted-alternative") {
    return {
      title: t("acceptedTitle"),
      description: t("acceptedDescription", {
        date: formatDate(reservation.date),
        time: reservation.time,
      }),
      color: "teal",
      background: uiColors.statusSuccessSurface,
      icon: IconCircleCheck,
    };
  }

  if (response.kind === "declined-alternative") {
    const declinedSlot =
      response.proposedDate && response.proposedTime
        ? `${formatDate(response.proposedDate)} · ${response.proposedTime}`
        : t("declinedSlot");

    return {
      title: t("declinedTitle"),
      description: t("declinedDescription", { slot: declinedSlot }),
      color: "red",
      background: uiColors.statusErrorSurface,
      icon: IconX,
    };
  }

  if (response.kind === "requested-another-time") {
    return {
      title: t("requestedTitle"),
      description: t("requestedDescription", {
        date: formatDate(reservation.date),
        time: reservation.time,
      }),
      color: "warmCoral",
      background: uiColors.statusWarningSurface,
      icon: IconCalendarClock,
    };
  }

  return {
    title: t("waitingTitle"),
    description: t("waitingDescription", {
      date: formatDate(response.proposedDate),
      time: response.proposedTime,
    }),
    color: "warmCoral",
    background: uiColors.statusInfoSurface,
    icon: IconMessageCircle,
  };
}

function OwnerCustomerResponseContent({
  reservation,
  response,
}: {
  reservation: OwnerReservation;
  response: OwnerCustomerResponse;
}) {
  const content = useResponseContent(response, reservation);
  const ResponseIcon = content.icon;

  return (
    <Card
      radius="lg"
      p="md"
      style={{
        background: content.background,
        border: `1px solid ${uiColors.border}`,
      }}
    >
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <ThemeIcon
          color={content.color}
          variant="light"
          radius="xl"
          size={38}
          style={{ flexShrink: 0 }}
        >
          <ResponseIcon size={19} />
        </ThemeIcon>
        <Stack gap={3} style={{ flex: 1 }}>
          <Text fw={800} size="sm" c={uiColors.textPrimary}>
            {content.title}
          </Text>
          <Text size="xs" c={uiColors.textSecondary}>
            {content.description}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}

export function OwnerCustomerResponseCard({
  reservation,
}: {
  reservation: OwnerReservation;
}) {
  return reservation.customerResponse ? (
    <OwnerCustomerResponseContent
      reservation={reservation}
      response={reservation.customerResponse}
    />
  ) : null;
}
