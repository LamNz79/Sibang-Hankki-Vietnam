"use client";

import { Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconCalendarClock, IconX } from "@tabler/icons-react";
import { useFormatter, useTranslations } from "next-intl";
import type { CustomerReservation } from "@/features/reservations/types";
import { restaurantTimeZone, toRestaurantDate } from "@/lib/date-time";
import { uiColors } from "@/theme";

export function CustomerChangeRequestCard({
  reservation,
}: {
  reservation: CustomerReservation;
}) {
  const format = useFormatter();
  const t = useTranslations("CustomerReservationDetails.changeRequest");
  const request = reservation.changeRequest;
  if (!request) return null;

  const pending = request.status === "PENDING";
  const date = format.dateTime(toRestaurantDate(request.date), {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: restaurantTimeZone,
  });
  const Icon = pending ? IconCalendarClock : IconX;

  return (
    <Card
      radius="lg"
      p="md"
      style={{
        background: pending
          ? uiColors.statusInfoSurface
          : uiColors.statusErrorSurface,
        border: `1px solid ${uiColors.border}`,
      }}
    >
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <ThemeIcon
          color={pending ? "blue" : "red"}
          variant="light"
          radius="xl"
          size={38}
        >
          <Icon size={19} />
        </ThemeIcon>
        <Stack gap={3} style={{ flex: 1 }}>
          <Text fw={800} size="sm" c={uiColors.textPrimary}>
            {pending ? t("pendingTitle") : t("declinedTitle")}
          </Text>
          <Text size="xs" c={uiColors.textSecondary}>
            {pending
              ? t("pendingDescription", { date, time: request.time })
              : t("declinedDescription", { date, time: request.time })}
          </Text>
          {request.message ? (
            <Text size="xs" mt={4} c={uiColors.textPrimary}>
              {request.message}
            </Text>
          ) : null}
        </Stack>
      </Group>
    </Card>
  );
}
