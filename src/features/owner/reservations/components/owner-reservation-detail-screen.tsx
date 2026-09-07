"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
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
import { useFormatter, useTranslations } from "next-intl";
import {
  IconBell,
  IconCalendarEvent,
  IconCheck,
  IconDots,
  IconPhone,
  IconSofa,
  IconToolsKitchen3,
  IconUserCheck,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { OwnerShell } from "@/features/owner/shared";
import { useOwnerReservation } from "@/features/owner/hooks/use-owner-reservations";
import { confirmOwnerReservation } from "@/features/owner/data/owner-reservation-storage";
import type {
  OwnerRequestResponse,
  OwnerReservation,
} from "@/features/owner/types";
import { uiColors } from "@/theme";
import { OwnerCustomerResponseCard } from "./owner-customer-response-card";
import { OwnerReservationSummaryCard } from "./owner-reservation-summary-card";
import {
  OwnerReservationResponsePanel,
} from "./owner-reservation-response-panel";
import { OwnerServiceNotesCard } from "./owner-service-notes-card";
import {
  LARGE_PARTY_THRESHOLD,
  ReservationStatus,
  VisitStatus,
} from "@/features/reservations/types";

function ReservationInfoRow({
  icon: InfoIcon,
  label,
  value,
  iconBackground,
  iconColor,
  emphasized = false,
}: {
  icon: typeof IconCalendarEvent;
  label: string;
  value: string;
  iconBackground: string;
  iconColor: string;
  emphasized?: boolean;
}) {
  return (
    <Group
      gap="sm"
      wrap="nowrap"
      px={emphasized ? "sm" : 0}
      py={emphasized ? "xs" : 0}
      style={{
        borderRadius: 12,
        background: emphasized ? iconBackground : undefined,
        border: emphasized ? `1px solid ${uiColors.border}` : undefined,
      }}
    >
      <ThemeIcon
        size={30}
        radius="md"
        variant="filled"
        style={{ background: iconBackground, color: iconColor }}
      >
        <InfoIcon size={16} />
      </ThemeIcon>
      <Stack gap={0}>
        <Text size="xs" c={uiColors.textSecondary}>
          {label}
        </Text>
        <Text
          size={emphasized ? "md" : "sm"}
          fw={emphasized ? 800 : 600}
          c={emphasized ? iconColor : uiColors.textPrimary}
        >
          {value}
        </Text>
      </Stack>
    </Group>
  );
}

function getPersistedResponse(
  reservation: OwnerReservation | undefined,
  formatDate: (date: string) => string,
): OwnerRequestResponse {
  const customerResponse = reservation?.customerResponse;

  if (customerResponse?.kind === "awaiting-customer") {
    return {
      kind: "alternative-sent",
      slot: `${formatDate(customerResponse.proposedDate)} · ${customerResponse.proposedTime}`,
    };
  }

  return { kind: "pending" };
}

export function OwnerReservationDetailScreen() {
  const format = useFormatter();
  const t = useTranslations("OwnerReservationDetails");
  const params = useParams<{ id: string }>();
  const reservation = useOwnerReservation(params.id);
  const formatDate = (date: string) =>
    format.dateTime(new Date(`${date}T00:00:00`), {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

  if (!reservation) {
    return (
      <OwnerShell title={t("title")} backHref="/owner">
        <Card p="xl">
          <Text fw={700}>{t("notFound")}</Text>
        </Card>
      </OwnerShell>
    );
  }

  const hasArrived = reservation.visitStatus !== VisitStatus.Expected;
  const isLargeParty = reservation.partySize > LARGE_PARTY_THRESHOLD;
  const arrivalHref = `/owner/reservations/${reservation.id}/arrival`;
  const displayStatus = reservation.reservationStatus;
  const persistedResponse = getPersistedResponse(reservation, formatDate);
  const response =
    persistedResponse.kind === "alternative-sent"
      ? persistedResponse
      : (reservation.requestResponse ?? persistedResponse);
  const canRespond =
    displayStatus === ReservationStatus.Pending ||
    displayStatus === ReservationStatus.AlternativeProposed ||
    reservation.requestResponse?.kind === "unavailable" ||
    (displayStatus === ReservationStatus.Declined &&
      reservation.customerResponse?.kind === "declined-alternative");

  const notifyGuest = () => {
    notifications.show({
      color: "teal",
      title: t("notification.title"),
      message: t("notification.message", { guest: reservation.guestName }),
    });
  };

  const confirmReservation = () => {
    confirmOwnerReservation(reservation.id);
    notifyGuest();
  };

  const footerAction = displayStatus === ReservationStatus.Confirmed ? (
    <Button
      component={Link}
      href={arrivalHref}
      fullWidth
      size="md"
      radius="md"
      leftSection={<IconUserCheck size={19} />}
    >
      {hasArrived
        ? t("footer.viewArrival", { guest: reservation.guestName })
        : t("footer.checkIn", { guest: reservation.guestName })}
    </Button>
  ) : displayStatus === ReservationStatus.Declined ? null : (
      <Button
        fullWidth
        size="md"
        radius="md"
        leftSection={
          response.kind === "pending" ? <IconCheck size={19} /> : undefined
        }
        disabled={
          response.kind !== "pending" ||
          displayStatus === ReservationStatus.AlternativeProposed
        }
        onClick={confirmReservation}
      >
        {response.kind === "alternative-sent"
          ? t("footer.waiting")
          : response.kind === "unavailable"
            ? t("footer.closed")
            : t("footer.confirm")}
      </Button>
    );

  return (
    <OwnerShell
      title={t("title")}
      eyebrow={t("eyebrow")}
      backHref="/owner"
      headerAction={
        <Menu position="bottom-end" shadow="md" width={190}>
          <Menu.Target>
            <ActionIcon
              variant="light"
              color="gray"
              radius="xl"
              size={40}
              aria-label={t("menu.aria")}
            >
              <IconDots size={21} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{t("menu.label")}</Menu.Label>
            <Menu.Item
              component="a"
              href={`tel:${reservation.phone ?? ""}`}
              leftSection={<IconPhone size={16} />}
              disabled={!reservation.phone}
            >
              {t("menu.contact")}
            </Menu.Item>
            <Menu.Item
              color="red"
              leftSection={<IconX size={16} />}
              disabled
            >
              {t("menu.cancel")}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      }
      footerAction={footerAction}
    >
      <Stack gap="md">
        <OwnerReservationSummaryCard
          reservation={reservation}
          status={hasArrived ? reservation.visitStatus : displayStatus}
        />

        <OwnerCustomerResponseCard reservation={reservation} />

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
              {t("information.title")}
            </Text>
            <ReservationInfoRow
              icon={IconCalendarEvent}
              label={t("information.date")}
              value={formatDate(reservation.date)}
              iconBackground={uiColors.detailDateSurface}
              iconColor={uiColors.detailDateText}
            />
            <ReservationInfoRow
              icon={IconUsers}
              label={
                isLargeParty
                  ? t("information.largeParty")
                  : t("information.guests")
              }
              value={t("information.guestCount", {
                count: reservation.partySize,
              })}
              iconBackground={
                isLargeParty
                  ? uiColors.statusWarningSurface
                  : uiColors.detailGuestsSurface
              }
              iconColor={
                isLargeParty
                  ? uiColors.statusWarningText
                  : uiColors.detailGuestsText
              }
              emphasized
            />
            <ReservationInfoRow
              icon={IconSofa}
              label={t("information.table")}
              value={
                reservation.table === "Not assigned"
                  ? t("information.notAssigned")
                  : reservation.table
              }
              iconBackground={uiColors.brandPrimarySoft}
              iconColor={uiColors.brandPrimary}
            />
            <ReservationInfoRow
              icon={IconToolsKitchen3}
              label={t("information.preOrder")}
              value={reservation.preOrderName ?? t("information.noPreOrder")}
              iconBackground={uiColors.detailPreOrderSurface}
              iconColor={uiColors.detailPreOrderText}
            />
          </Stack>
        </Card>

        <OwnerServiceNotesCard note={reservation.note} />

        {canRespond ? (
          <OwnerReservationResponsePanel
            reservation={reservation}
            response={response}
          />
        ) : null}

        {displayStatus === ReservationStatus.Confirmed ? (
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
                  {t("confirmation.title")}
                </Text>
                <Text size="xs" c={uiColors.textSecondary}>
                  {t("confirmation.description")}
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
                {t("confirmation.notify")}
              </Button>
              <Button
                component="a"
                href={`tel:${reservation.phone ?? ""}`}
                variant="default"
                leftSection={<IconPhone size={17} />}
                disabled={!reservation.phone}
              >
                {t("confirmation.call")}
              </Button>
            </Group>
          </Card>
        ) : null}
      </Stack>
    </OwnerShell>
  );
}
