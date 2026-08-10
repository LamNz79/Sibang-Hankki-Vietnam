import dayjs from "dayjs";
import { Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import {
  IconCalendarClock,
  IconCircleCheck,
  IconMessageCircle,
  IconX,
} from "@tabler/icons-react";
import type {
  OwnerCustomerResponse,
  OwnerReservation,
} from "@/features/owner/types";
import { uiColors } from "@/theme";

function getResponseContent(
  response: OwnerCustomerResponse,
  reservation: OwnerReservation,
) {
  if (response.kind === "accepted-alternative") {
    return {
      title: "Guest accepted the suggested time",
      description: `Confirmed for ${dayjs(reservation.date).format("ddd, MMM D")} at ${reservation.time}.`,
      color: "teal",
      background: uiColors.statusSuccessSurface,
      icon: IconCircleCheck,
    };
  }

  if (response.kind === "declined-alternative") {
    const declinedSlot =
      response.proposedDate && response.proposedTime
        ? `${dayjs(response.proposedDate).format("ddd, MMM D")} at ${response.proposedTime}`
        : "the suggested time";

    return {
      title: "Guest declined the suggested time",
      description: `The guest declined ${declinedSlot}. Suggest another slot or contact them directly.`,
      color: "red",
      background: uiColors.statusErrorSurface,
      icon: IconX,
    };
  }

  if (response.kind === "requested-another-time") {
    return {
      title: "Guest requested another time",
      description: `Review the new request for ${dayjs(reservation.date).format("ddd, MMM D")} at ${reservation.time}.`,
      color: "warmCoral",
      background: uiColors.statusWarningSurface,
      icon: IconCalendarClock,
    };
  }

  return {
    title: "Waiting for guest response",
    description: `Suggested ${dayjs(response.proposedDate).format("ddd, MMM D")} at ${response.proposedTime}.`,
    color: "warmCoral",
    background: uiColors.statusInfoSurface,
    icon: IconMessageCircle,
  };
}

export function OwnerCustomerResponseCard({
  reservation,
}: {
  reservation: OwnerReservation;
}) {
  const response = reservation.customerResponse;
  if (!response) return null;

  const content = getResponseContent(response, reservation);
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
