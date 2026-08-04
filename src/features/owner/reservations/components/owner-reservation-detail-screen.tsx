"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import { useState } from "react";
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
import { notifications } from "@mantine/notifications";
import {
  IconBell,
  IconCalendarEvent,
  IconCheck,
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
import {
  OwnerReservationResponsePanel,
  type OwnerRequestResponse,
} from "./owner-reservation-response-panel";
import { OwnerServiceNotesCard } from "./owner-service-notes-card";
import type { OwnerReservationStatus } from "@/features/owner/types";

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
  const [displayStatus, setDisplayStatus] = useState<OwnerReservationStatus>(
    reservation?.status ?? "pending",
  );
  const [response, setResponse] = useState<OwnerRequestResponse>({
    kind: "pending",
  });

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
    displayStatus,
  );
  const arrivalHref = `/owner/reservations/${reservation.id}/arrival`;

  const notifyGuest = () => {
    notifications.show({
      color: "teal",
      title: "Confirmation sent",
      message: `${reservation.guestName} was notified that the table is confirmed.`,
    });
  };

  const confirmReservation = () => {
    setDisplayStatus("confirmed");
    notifyGuest();
  };

  const footerAction =
    displayStatus === "pending" ? (
      <Button
        fullWidth
        size="md"
        radius="md"
        leftSection={
          response.kind === "pending" ? <IconCheck size={19} /> : undefined
        }
        disabled={response.kind !== "pending"}
        onClick={confirmReservation}
      >
        {response.kind === "alternative-sent"
          ? "Waiting for guest response"
          : response.kind === "unavailable"
            ? "Request closed"
            : "Confirm reservation"}
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
            <Menu.Item
              component="a"
              href={`tel:${reservation.phone ?? ""}`}
              leftSection={<IconPhone size={16} />}
              disabled={!reservation.phone}
            >
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
        <OwnerReservationSummaryCard
          reservation={reservation}
          status={displayStatus}
        />

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

        {reservation.status === "pending" && displayStatus === "pending" ? (
          <OwnerReservationResponsePanel
            reservation={reservation}
            response={response}
            onResponseChange={setResponse}
          />
        ) : null}

        {displayStatus === "confirmed" ? (
          <Card
            radius="lg"
            p="md"
            style={{
              background: uiColors.statusSuccessSurface,
              border: `1px solid ${uiColors.border}`,
            }}
          >
            <Group gap="sm" wrap="nowrap">
              <ThemeIcon color="teal" variant="light" radius="xl">
                <IconCheck size={17} />
              </ThemeIcon>
              <Stack gap={2} style={{ flex: 1 }}>
                <Text fw={750} size="sm" c={uiColors.statusSuccessText}>
                  Guest confirmation
                </Text>
                <Text size="xs" c={uiColors.textSecondary}>
                  Send the confirmed booking in the app. Call only when the
                  guest needs urgent or special follow-up.
                </Text>
              </Stack>
            </Group>

            <Group grow gap="sm" mt="md">
              <Button
                variant="outline"
                color="teal"
                leftSection={<IconBell size={17} />}
                onClick={notifyGuest}
              >
                Notify guest
              </Button>
              <Button
                component="a"
                href={`tel:${reservation.phone ?? ""}`}
                variant="default"
                leftSection={<IconPhone size={17} />}
                disabled={!reservation.phone}
              >
                Call guest
              </Button>
            </Group>
          </Card>
        ) : null}
      </Stack>
    </OwnerShell>
  );
}
