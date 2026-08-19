"use client";

import dayjs from "dayjs";
import {
  Button,
  Card,
  Drawer,
  Group,
  Stack,
  Text,
  Textarea,
  UnstyledButton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCalendarClock,
  IconCircleX,
  IconPhone,
  IconSend,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui";
import {
  rejectOwnerReservation,
  reopenOwnerReservation,
} from "@/features/owner/data/owner-reservation-storage";
import type {
  OwnerRequestResponse,
  OwnerReservation,
} from "@/features/owner/types";
import { proposeAlternativeReservation } from "@/features/reservations/data/reservation-storage";
import { uiColors } from "@/theme";

type OwnerReservationResponsePanelProps = {
  reservation: OwnerReservation;
  response: OwnerRequestResponse;
};

const unavailableReasons = [
  "Fully booked",
  "Cannot accommodate this party size",
  "Restaurant is closed",
  "Other",
];

const mobileDrawerStyles = {
  content: {
    width: "100%",
    maxWidth: 560,
    marginLeft: "auto",
    marginRight: "auto",
    left: "50%",
    transform: "translateX(-50%)",
  },
  header: {
    borderBottom: `1px solid ${uiColors.border}`,
  },
};

function OptionButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <UnstyledButton onClick={onClick} style={{ width: "100%" }}>
      <Card
        radius="md"
        p="sm"
        style={{
          width: "100%",
          background: active ? uiColors.brandPrimarySoft : uiColors.surface,
          border: active
            ? `1px solid ${uiColors.brandPrimary}`
            : `1px solid ${uiColors.borderStrong}`,
        }}
      >
        <Text fw={active ? 750 : 600} c={uiColors.textPrimary}>
          {label}
        </Text>
      </Card>
    </UnstyledButton>
  );
}

export function OwnerReservationResponsePanel({
  reservation,
  response,
}: OwnerReservationResponsePanelProps) {
  const [alternativeOpened, setAlternativeOpened] = useState(false);
  const [unavailableOpened, setUnavailableOpened] = useState(false);
  const [selectedAlternative, setSelectedAlternative] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [message, setMessage] = useState("");

  const alternativeSlots = useMemo(() => {
    const requestedDate = dayjs(reservation.date);

    return [
      { date: reservation.date, time: "18:00" },
      { date: reservation.date, time: "19:30" },
      { date: requestedDate.add(1, "day").format("YYYY-MM-DD"), time: "18:00" },
      { date: requestedDate.add(1, "day").format("YYYY-MM-DD"), time: "18:30" },
    ]
      .filter(
        (slot) =>
          slot.date !== reservation.date || slot.time !== reservation.time,
      )
      .map((slot) => ({
        ...slot,
        id: `${slot.date}|${slot.time}`,
        label: `${dayjs(slot.date).format("ddd, MMM D")} · ${slot.time}`,
      }));
  }, [reservation.date, reservation.time]);

  const sendAlternative = () => {
    const selectedSlot = alternativeSlots.find(
      (slot) => slot.id === selectedAlternative,
    );
    if (!selectedSlot) return;

    proposeAlternativeReservation({
      id: reservation.id,
      restaurantSlug: "royal-pavilion",
      restaurantName: "The Royal Pavilion",
      district: "District 1",
      cuisineLabel: "Chinese",
      date: reservation.date,
      time: reservation.time,
      guests: reservation.partySize,
      reference: reservation.reference,
      preOrder: reservation.preOrderName,
      specialRequest: reservation.note,
      proposedDate: selectedSlot.date,
      proposedTime: selectedSlot.time,
      message: message.trim() || undefined,
      respondBy: dayjs(`${selectedSlot.date}T${selectedSlot.time}`)
        .subtract(30, "minute")
        .toISOString(),
    });
    setAlternativeOpened(false);
    notifications.show({
      color: "warmCoral",
      title: "Alternative time sent",
      message: `${reservation.guestName} will receive an in-app notification and can accept or decline.`,
    });
  };

  const markUnavailable = () => {
    if (!selectedReason) return;

    rejectOwnerReservation(reservation.id, selectedReason);
    setUnavailableOpened(false);
    notifications.show({
      color: "red",
      title: "Guest notified",
      message: `The request was declined because: ${selectedReason}.`,
    });
  };

  return (
    <>
      <Card
        radius="lg"
        p="md"
        style={{
          background:
            response.kind === "unavailable"
              ? uiColors.statusErrorSurface
              : uiColors.statusInfoSurface,
          border: `1px solid ${response.kind === "unavailable"
            ? uiColors.statusErrorText
            : uiColors.border
            }`,
        }}
      >
        <Stack gap="md">
          <Stack gap={4}>
            <Group justify="space-between" align="center" wrap="nowrap">
              <Text fw={800} c={uiColors.textPrimary}>
                Respond to request
              </Text>
              {response.kind === "alternative-sent" ? (
                <StatusBadge tone="info">Alternative sent</StatusBadge>
              ) : response.kind === "unavailable" ? (
                <StatusBadge tone="error">Unable to accommodate</StatusBadge>
              ) : (
                <StatusBadge tone="warning">Awaiting response</StatusBadge>
              )}
            </Group>

            <Text size="sm" c={uiColors.textSecondary}>
              {response.kind === "alternative-sent"
                ? `Waiting for the guest to respond to ${response.slot}.`
                : response.kind === "unavailable"
                  ? `The guest was notified: ${response.reason}.`
                  : "Confirm the requested time, suggest another time, or let the guest know the restaurant is full."}
            </Text>
            <Text size="xs" c={uiColors.textMuted}>
              Updates are sent by in-app notification. Call the guest when a
              same-day or special request needs a quick answer.
            </Text>
          </Stack>

          {response.kind !== "unavailable" ? (
            <Button
              variant="outline"
              color="warmCoral"
              fullWidth
              leftSection={<IconCalendarClock size={18} />}
              onClick={() => setAlternativeOpened(true)}
            >
              {response.kind === "alternative-sent"
                ? "Change suggested time"
                : "Suggest another time"}
            </Button>
          ) : null}

          <Group grow gap="sm">
            <Button
              component="a"
              href={`tel:${reservation.phone ?? ""}`}
              variant="default"
              leftSection={<IconPhone size={17} />}
              disabled={!reservation.phone}
            >
              Call guest
            </Button>
            {response.kind !== "unavailable" ? (
              <Button
                variant="subtle"
                color="red"
                leftSection={<IconCircleX size={17} />}
                onClick={() => setUnavailableOpened(true)}
              >
                No table
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={() => reopenOwnerReservation(reservation.id)}
              >
                Reopen request
              </Button>
            )}
          </Group>
        </Stack>
      </Card>

      <Drawer
        opened={alternativeOpened}
        onClose={() => setAlternativeOpened(false)}
        position="bottom"
        size="72%"
        radius="24px 24px 0 0"
        padding="md"
        title={<Text fw={800}>Suggest another time</Text>}
        styles={mobileDrawerStyles}
        classNames={{ content: "hide-scrollbar", body: "hide-scrollbar" }}
      >
        <Stack gap="lg" pb="md">
          <Text size="sm" c={uiColors.textSecondary}>
            The requested time is {dayjs(reservation.date).format("ddd, MMM D")} · {reservation.time}.
            Select one alternative for the guest.
          </Text>

          <Stack gap="sm">
            {alternativeSlots.map((slot) => (
              <OptionButton
                key={slot.id}
                active={selectedAlternative === slot.id}
                label={slot.label}
                onClick={() => setSelectedAlternative(slot.id)}
              />
            ))}
          </Stack>

          <Textarea
            label="Message (optional)"
            placeholder="For example: We can keep a window table at this time."
            value={message}
            onChange={(event) => setMessage(event.currentTarget.value)}
            autosize
            minRows={2}
          />

          <Button
            fullWidth
            size="md"
            leftSection={<IconSend size={18} />}
            disabled={!selectedAlternative}
            onClick={sendAlternative}
          >
            Send suggested time
          </Button>
        </Stack>
      </Drawer>

      <Drawer
        opened={unavailableOpened}
        onClose={() => setUnavailableOpened(false)}
        position="bottom"
        size="62%"
        radius="24px 24px 0 0"
        padding="md"
        title={<Text fw={800}>Unable to accommodate</Text>}
        styles={mobileDrawerStyles}
        classNames={{ content: "hide-scrollbar", body: "hide-scrollbar" }}
      >
        <Stack gap="lg" pb="md">
          <Text size="sm" c={uiColors.textSecondary}>
            Choose a clear reason. The guest will receive it in the app instead
            of waiting without an answer.
          </Text>

          <Stack gap="sm">
            {unavailableReasons.map((reason) => (
              <OptionButton
                key={reason}
                active={selectedReason === reason}
                label={reason}
                onClick={() => setSelectedReason(reason)}
              />
            ))}
          </Stack>

          <Button
            fullWidth
            size="md"
            color="red"
            disabled={!selectedReason}
            onClick={markUnavailable}
          >
            Notify guest
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}
