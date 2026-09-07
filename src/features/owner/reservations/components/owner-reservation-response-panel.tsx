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
import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
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
  { value: "Fully booked", key: "fullyBooked" },
  { value: "Cannot accommodate this party size", key: "partySize" },
  { value: "Restaurant is closed", key: "closed" },
  { value: "Other", key: "other" },
] as const;

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
  const format = useFormatter();
  const t = useTranslations("OwnerReservationDetails.response");
  const [alternativeOpened, setAlternativeOpened] = useState(false);
  const [unavailableOpened, setUnavailableOpened] = useState(false);
  const [selectedAlternative, setSelectedAlternative] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [message, setMessage] = useState("");
  const formatDate = (date: string) =>
    format.dateTime(new Date(`${date}T00:00:00`), {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  const getReasonLabel = (reason: string) => {
    const option = unavailableReasons.find((item) => item.value === reason);
    return option ? t(`reasons.${option.key}`) : reason;
  };

  const requestedDate = dayjs(reservation.date);
  const alternativeSlots = [
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
        label: `${formatDate(slot.date)} · ${slot.time}`,
      }));

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
      title: t("alternativeDrawer.sentTitle"),
      message: t("alternativeDrawer.sentMessage", {
        guest: reservation.guestName,
      }),
    });
  };

  const markUnavailable = () => {
    if (!selectedReason) return;

    rejectOwnerReservation(reservation.id, selectedReason);
    setUnavailableOpened(false);
    notifications.show({
      color: "red",
      title: t("unavailableDrawer.notifiedTitle"),
      message: t("unavailableDrawer.notifiedMessage", {
        reason: getReasonLabel(selectedReason),
      }),
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
                {t("title")}
              </Text>
              {response.kind === "alternative-sent" ? (
                <StatusBadge tone="info">{t("alternativeSent")}</StatusBadge>
              ) : response.kind === "unavailable" ? (
                <StatusBadge tone="error">{t("unable")}</StatusBadge>
              ) : (
                <StatusBadge tone="warning">{t("awaiting")}</StatusBadge>
              )}
            </Group>

            <Text size="sm" c={uiColors.textSecondary}>
              {response.kind === "alternative-sent"
                ? t("waiting", { slot: response.slot })
                : response.kind === "unavailable"
                  ? t("notified", {
                      reason: getReasonLabel(response.reason),
                    })
                  : t("instructions")}
            </Text>
            <Text size="xs" c={uiColors.textMuted}>
              {t("updates")}
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
                ? t("changeTime")
                : t("suggestTime")}
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
              {t("call")}
            </Button>
            {response.kind !== "unavailable" ? (
              <Button
                variant="subtle"
                color="red"
                leftSection={<IconCircleX size={17} />}
                onClick={() => setUnavailableOpened(true)}
              >
                {t("noTable")}
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={() => reopenOwnerReservation(reservation.id)}
              >
                {t("reopen")}
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
        title={<Text fw={800}>{t("alternativeDrawer.title")}</Text>}
        styles={mobileDrawerStyles}
        classNames={{ content: "hide-scrollbar", body: "hide-scrollbar" }}
      >
        <Stack gap="lg" pb="md">
          <Text size="sm" c={uiColors.textSecondary}>
            {t("alternativeDrawer.description", {
              slot: `${formatDate(reservation.date)} · ${reservation.time}`,
            })}
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
            label={t("alternativeDrawer.message")}
            placeholder={t("alternativeDrawer.placeholder")}
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
            {t("alternativeDrawer.send")}
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
        title={<Text fw={800}>{t("unavailableDrawer.title")}</Text>}
        styles={mobileDrawerStyles}
        classNames={{ content: "hide-scrollbar", body: "hide-scrollbar" }}
      >
        <Stack gap="lg" pb="md">
          <Text size="sm" c={uiColors.textSecondary}>
            {t("unavailableDrawer.description")}
          </Text>

          <Stack gap="sm">
            {unavailableReasons.map((reason) => (
              <OptionButton
                key={reason.value}
                active={selectedReason === reason.value}
                label={t(`reasons.${reason.key}`)}
                onClick={() => setSelectedReason(reason.value)}
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
            {t("unavailableDrawer.notify")}
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}
