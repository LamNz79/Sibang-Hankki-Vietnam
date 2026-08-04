"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Menu,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconChevronRight,
  IconDots,
  IconPhone,
  IconSofa,
  IconToolsKitchen3,
  IconUserCheck,
  IconX,
} from "@tabler/icons-react";
import { OwnerShell } from "@/features/owner/shared";
import { getOwnerReservation } from "@/features/owner/data/mock-data";
import { uiColors } from "@/theme";
import { OwnerReservationSummaryCard } from "./owner-reservation-summary-card";
import { OwnerServiceNotesCard } from "./owner-service-notes-card";

function ReservationInfoRow({
  icon: InfoIcon,
  label,
}: {
  icon: typeof IconCalendarEvent;
  label: string;
}) {
  return (
    <Group gap="sm" wrap="nowrap">
      <ThemeIcon
        size={30}
        radius="md"
        variant="light"
        color="warmCoral"
      >
        <InfoIcon size={16} />
      </ThemeIcon>
      <Text size="sm" c={uiColors.textSecondary}>
        {label}
      </Text>
    </Group>
  );
}

export function OwnerReservationDetailScreen() {
  const params = useParams<{ id: string }>();
  const reservation = getOwnerReservation(params.id);

  if (!reservation) {
    return (
      <OwnerShell title="Reservation details" backHref="/owner">
        <Card p="xl">
          <Text fw={700}>Reservation not found.</Text>
        </Card>
      </OwnerShell>
    );
  }

  const hasArrived = ["arrived", "seated", "completed"].includes(
    reservation.status,
  );
  const arrivalHref = `/owner/reservations/${reservation.id}/arrival`;

  const footerAction =
    reservation.status === "pending" ? (
      <Button fullWidth size="md" radius="md" disabled>
        Confirm reservation before check-in
      </Button>
    ) : (
      <Button
        component={Link}
        href={arrivalHref}
        fullWidth
        size="md"
        radius="md"
        leftSection={<IconUserCheck size={19} />}
      >
        {hasArrived
          ? `View ${reservation.guestName}'s arrival`
          : `Check in ${reservation.guestName}`}
      </Button>
    );

  return (
    <OwnerShell
      title="Reservation details"
      eyebrow="Selected guest only"
      backHref="/owner"
      headerAction={
        <Menu position="bottom-end" shadow="md" width={190}>
          <Menu.Target>
            <ActionIcon
              variant="light"
              color="gray"
              radius="xl"
              size={40}
              aria-label="Reservation actions"
            >
              <IconDots size={21} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Reservation actions</Menu.Label>
            <Menu.Item leftSection={<IconPhone size={16} />} disabled>
              Contact guest
            </Menu.Item>
            <Menu.Item
              color="red"
              leftSection={<IconX size={16} />}
              disabled
            >
              Cancel reservation
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      }
      footerAction={footerAction}
    >
      <Stack gap="md">
        <OwnerReservationSummaryCard reservation={reservation} />

        <Card
          radius="lg"
          p="md"
          style={{
            background: uiColors.surface,
            border: `1px solid ${uiColors.border}`,
          }}
        >
          <Stack gap="sm">
            <Text fw={800} size="sm" c={uiColors.textPrimary}>
              Reservation information
            </Text>
            <ReservationInfoRow
              icon={IconCalendarEvent}
              label={dayjs(reservation.date).format("dddd, MMM D")}
            />
            <ReservationInfoRow icon={IconSofa} label={reservation.table} />
            <ReservationInfoRow
              icon={IconToolsKitchen3}
              label={reservation.preOrderName ?? "No pre-order"}
            />
          </Stack>
        </Card>

        <OwnerServiceNotesCard note={reservation.note} />

        {reservation.status === "pending" ? (
          <Card
            radius="lg"
            p="md"
            style={{
              background: uiColors.statusInfoSurface,
              border: `1px solid ${uiColors.border}`,
            }}
          >
            <Group gap="sm" wrap="nowrap">
              <Text size="sm" c={uiColors.statusInfoText} style={{ flex: 1 }}>
                Review and confirm this request before the guest can be checked
                in.
              </Text>
              <IconChevronRight size={18} color={uiColors.statusInfoText} />
            </Group>
          </Card>
        ) : null}
      </Stack>
    </OwnerShell>
  );
}
