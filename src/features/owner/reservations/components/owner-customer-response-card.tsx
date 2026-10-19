"use client";

import { Alert, Button, Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
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

  if (response.kind === "change-request") {
    return {
      title: t("changeTitle"),
      description: t("changeDescription", {
        date: formatDate(response.requestedDate),
        time: response.requestedTime,
      }),
      color: "blue",
      background: uiColors.statusInfoSurface,
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
  onAcceptChange,
  onDeclineChange,
  loading,
  error,
}: {
  reservation: OwnerReservation;
  response: OwnerCustomerResponse;
  onAcceptChange?: () => void;
  onDeclineChange?: () => void;
  loading?: boolean;
  error?: boolean;
}) {
  const content = useResponseContent(response, reservation);
  const t = useTranslations("OwnerReservationDetails.customerResponse");
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
          {response.kind === "change-request" && response.message ? (
            <Text size="xs" mt={4} c={uiColors.textPrimary}>
              {response.message}
            </Text>
          ) : null}
          {response.kind === "change-request" ? (
            <>
              {error ? <Alert color="red" title={t("changeError")} mt="xs" /> : null}
              <Group grow mt="sm">
                <Button
                  variant="default"
                  disabled={loading}
                  onClick={onDeclineChange}
                >
                  {t("declineChange")}
                </Button>
                <Button loading={loading} onClick={onAcceptChange}>
                  {t("acceptChange")}
                </Button>
              </Group>
            </>
          ) : null}
        </Stack>
      </Group>
    </Card>
  );
}

export function OwnerCustomerResponseCard({
  reservation,
  onAcceptChange,
  onDeclineChange,
  loading,
  error,
}: {
  reservation: OwnerReservation;
  onAcceptChange?: (requestId: string) => void;
  onDeclineChange?: (requestId: string) => void;
  loading?: boolean;
  error?: boolean;
}) {
  const response = reservation.customerResponse;
  if (!response) return null;
  const changeRequest = response.kind === "change-request" ? response : null;

  return (
    <OwnerCustomerResponseContent
      reservation={reservation}
      response={response}
      onAcceptChange={
        changeRequest
          ? () => onAcceptChange?.(changeRequest.requestId)
          : undefined
      }
      onDeclineChange={
        changeRequest
          ? () => onDeclineChange?.(changeRequest.requestId)
          : undefined
      }
      loading={loading}
      error={error}
    />
  );
}
