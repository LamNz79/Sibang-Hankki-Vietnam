"use client";

import Link from "next/link";
import dayjs from "dayjs";
import {
  Button,
  Card,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconArrowRight,
  IconCalendarClock,
  IconCheck,
  IconClock,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import {
  acceptAlternativeProposal,
  declineAlternativeProposal,
  type CustomerReservation,
} from "@/features/reservations/data/reservation-storage";
import { uiColors } from "@/theme";

function TimeOption({
  label,
  date,
  time,
  suggested = false,
}: {
  label: string;
  date: string;
  time: string;
  suggested?: boolean;
}) {
  return (
    <Card
      radius="md"
      p="sm"
      style={{
        minHeight: 98,
        background: suggested ? uiColors.brandPrimarySoft : uiColors.surfaceMuted,
        border: suggested
          ? `1px solid ${uiColors.brandPrimary}`
          : `1px solid ${uiColors.border}`,
      }}
    >
      <Stack gap={3}>
        <Text
          size="xs"
          fw={700}
          c={suggested ? uiColors.brandPrimary : uiColors.textSecondary}
        >
          {label}
        </Text>
        <Text size="sm" c={uiColors.textSecondary}>
          {dayjs(date).format("ddd, MMM D")}
        </Text>
        <Text
          fw={800}
          size="lg"
          c={suggested ? uiColors.brandPrimaryStrong : uiColors.textPrimary}
          td={suggested ? undefined : "line-through"}
        >
          {time}
        </Text>
      </Stack>
    </Card>
  );
}

export function CustomerAlternativeProposalCard({
  reservation,
}: {
  reservation: CustomerReservation;
}) {
  const [declineOpened, setDeclineOpened] = useState(false);
  const proposal = reservation.alternativeProposal;

  if (!proposal) return null;

  const acceptProposal = () => {
    acceptAlternativeProposal(reservation.id);
    notifications.show({
      color: "teal",
      title: "New time confirmed",
      message: `${reservation.restaurantName} has been notified that you accepted ${proposal.time}.`,
    });
  };

  const declineProposal = () => {
    declineAlternativeProposal(reservation.id);
    setDeclineOpened(false);
    notifications.show({
      color: "warmCoral",
      title: "Request declined",
      message: `${reservation.restaurantName} has been notified.`,
    });
  };

  const respondBy = proposal.respondBy ? dayjs(proposal.respondBy) : null;
  const respondByLabel = respondBy?.isAfter(dayjs())
    ? respondBy.format("HH:mm · ddd, MMM D")
    : null;

  return (
    <>
      <Card
        radius="lg"
        p="md"
        style={{
          background: uiColors.surface,
          border: `1px solid ${uiColors.brandPrimary}`,
          boxShadow: `0 10px 28px ${uiColors.brandPrimaryShadow}`,
        }}
      >
        <Stack gap="md">
          <Group gap="sm" wrap="nowrap" align="flex-start">
            <ThemeIcon
              size={42}
              radius="xl"
              color="warmCoral"
              variant="light"
              style={{ flexShrink: 0 }}
            >
              <IconCalendarClock size={21} />
            </ThemeIcon>
            <Stack gap={2} style={{ flex: 1 }}>
              <Text fw={800} c={uiColors.textPrimary}>
                New time proposal
              </Text>
              <Text size="sm" c={uiColors.textSecondary}>
                The restaurant cannot confirm your original time and suggested
                another available slot.
              </Text>
            </Stack>
          </Group>

          <Group
            gap="xs"
            wrap="nowrap"
            align="center"
            style={{ position: "relative" }}
          >
            <SimpleGrid cols={2} spacing="xl" style={{ flex: 1 }}>
              <TimeOption
                label="Requested"
                date={reservation.date}
                time={reservation.time}
              />
              <TimeOption
                label="Suggested"
                date={proposal.date}
                time={proposal.time}
                suggested
              />
            </SimpleGrid>
            <ThemeIcon
              size={28}
              radius="xl"
              color="warmCoral"
              variant="filled"
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <IconArrowRight size={15} />
            </ThemeIcon>
          </Group>

          {proposal.message ? (
            <Card
              radius="md"
              p="sm"
              style={{
                background: uiColors.statusInfoSurface,
                border: `1px solid ${uiColors.border}`,
              }}
            >
              <Text size="xs" c={uiColors.textSecondary}>
                Restaurant message
              </Text>
              <Text size="sm" fw={650} c={uiColors.textPrimary}>
                {proposal.message}
              </Text>
            </Card>
          ) : null}

          {respondByLabel ? (
            <Group gap={6} wrap="nowrap">
              <IconClock size={16} color={uiColors.statusWarningText} />
              <Text size="xs" fw={650} c={uiColors.statusWarningText}>
                Please respond by {respondByLabel}
              </Text>
            </Group>
          ) : null}

          <Button
            fullWidth
            size="md"
            color="warmCoral"
            leftSection={<IconCheck size={18} />}
            onClick={acceptProposal}
          >
            Accept {proposal.time}
          </Button>

          <SimpleGrid cols={2} spacing="sm">
            <Button
              component={Link}
              href={`/reservation?restaurant=${reservation.restaurantSlug}&change=${reservation.id}`}
              variant="default"
            >
              Choose another time
            </Button>
            <Button
              variant="subtle"
              color="red"
              leftSection={<IconX size={16} />}
              onClick={() => setDeclineOpened(true)}
            >
              Decline request
            </Button>
          </SimpleGrid>
        </Stack>
      </Card>

      <Modal
        opened={declineOpened}
        onClose={() => setDeclineOpened(false)}
        centered
        radius="xl"
        title={<Text fw={800}>Decline this proposal?</Text>}
        styles={{
          inner: { padding: 16 },
          content: { width: "100%", maxWidth: 528 },
        }}
      >
        <Stack gap="lg">
          <Text size="sm" c={uiColors.textSecondary}>
            The restaurant will release the proposed {proposal.time} slot. You
            can still make a new reservation afterward.
          </Text>
          <Group grow>
            <Button variant="default" onClick={() => setDeclineOpened(false)}>
              Keep proposal
            </Button>
            <Button color="red" onClick={declineProposal}>
              Decline
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
