"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { restaurantTimeZone, toRestaurantDate } from "@/lib/date-time";
import {
  Alert,
  Button,
  Card,
  Grid,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconCheck,
  IconCircleCheck,
  IconSofa,
  IconUserCheck,
  IconUserX,
  IconX,
} from "@tabler/icons-react";
import { StatusBadge } from "@/components/ui";
import { AdminShell } from "@/features/admin/components/admin-shell";
import {
  canAdminTerminateReservation,
  getAdminReservationPrimaryAction,
  toAdminReservation,
  type AdminReservationStatus,
} from "@/features/admin/data/admin-reservations";
import {
  useOwnerManualCheckIn,
  useOwnerReservation,
  useOwnerReservationActions,
} from "@/features/owner/hooks/use-owner-reservations";
import { OwnerCustomerResponseCard } from "@/features/owner/reservations/components/owner-customer-response-card";
import { OwnerReservationResponsePanel } from "@/features/owner/reservations/components/owner-reservation-response-panel";
import { useOwnerSettings } from "@/features/owner/settings/hooks/use-owner-settings";
import { ReservationStatus } from "@/features/reservations/types";
import { uiColors } from "@/theme";

const statusTones: Record<
  AdminReservationStatus,
  "success" | "warning" | "info" | "error"
> = {
  pending: "warning",
  confirmed: "info",
  checkedIn: "success",
  cancelled: "error",
  declined: "error",
  noShow: "warning",
};

export function AdminReservationDetailScreen({ id }: { id: string }) {
  const locale = useLocale();
  const t = useTranslations("Admin.reservationDetail");
  const reservationsT = useTranslations("Admin.reservations");
  const ownerT = useTranslations("OwnerReservationDetails");
  const [cancelOpened, setCancelOpened] = useState(false);
  const [noShowOpened, setNoShowOpened] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const { reservation: ownerReservation, isPending, isError } =
    useOwnerReservation(id);
  const actions = useOwnerReservationActions(id);
  const manualCheckIn = useOwnerManualCheckIn();
  const { query: settingsQuery } = useOwnerSettings();

  if (isPending) {
    return (
      <AdminShell>
        <Text fw={700}>{t("loading")}</Text>
      </AdminShell>
    );
  }

  if (isError || !ownerReservation) {
    return (
      <AdminShell>
        <Alert color="red" title={t("loadError")} role="alert" />
      </AdminShell>
    );
  }

  const reservation = toAdminReservation(ownerReservation);
  const primaryAction = getAdminReservationPrimaryAction(ownerReservation);
  const actionPending = actions.isPending || manualCheckIn.isPending;
  const response = ownerReservation.customerResponse?.kind === "awaiting-customer"
    ? {
        kind: "alternative-sent" as const,
        slot: `${ownerReservation.customerResponse.proposedDate} · ${ownerReservation.customerResponse.proposedTime}`,
      }
    : (ownerReservation.requestResponse ?? { kind: "pending" as const });
  const runPrimaryAction = () => {
    if (primaryAction === "confirm") actions.confirm();
    if (primaryAction === "checkIn") manualCheckIn.mutate(id);
    if (primaryAction === "seat") actions.seat();
    if (primaryAction === "complete") actions.complete();
  };
  const actionContent = primaryAction ? {
    confirm: { label: t("operations.confirm"), icon: IconCheck },
    checkIn: { label: t("operations.checkIn"), icon: IconUserCheck },
    seat: { label: t("operations.seat"), icon: IconSofa },
    complete: { label: t("operations.complete"), icon: IconCircleCheck },
  }[primaryAction] : null;
  const PrimaryActionIcon = actionContent?.icon;
  const canTerminate = canAdminTerminateReservation(ownerReservation);
  const cancelReservation = async () => {
    if (!cancelReason.trim()) return;
    try {
      await actions.cancel(cancelReason.trim());
      setCancelOpened(false);
      setCancelReason("");
    } catch {
      // Keep the dialog open so the admin can retry.
    }
  };
  const markNoShow = async () => {
    try {
      await actions.markNoShow();
      setNoShowOpened(false);
    } catch {
      // Keep the dialog open so the admin can retry after reviewing the error.
    }
  };
  const formattedDate = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: restaurantTimeZone,
  }).format(toRestaurantDate(reservation.date));

  return (
    <AdminShell>
      <Stack gap="xl">
        <Stack gap="sm">
          <Button
            component={Link}
            href="/admin/reservations"
            variant="subtle"
            color="warmCoral"
            size="compact-sm"
            leftSection={<IconArrowLeft size={16} />}
            w="fit-content"
          >
            {t("back")}
          </Button>
          <Group justify="space-between" align="flex-end">
            <Stack gap={3}>
              <Title order={1}>{t("title")}</Title>
              <Text c={uiColors.textSecondary}>{reservation.reference}</Text>
            </Stack>
            <Group>
              <StatusBadge tone={statusTones[reservation.status]}>
                {reservationsT(`statuses.${reservation.status}`)}
              </StatusBadge>
            </Group>
          </Group>
        </Stack>

        <DetailCard title={t("manageReservation")}>
          <Stack p="md" gap="md">
            {(actions.isError || manualCheckIn.isError) ? (
              <Alert color="red" title={t("operations.error")} role="alert" />
            ) : null}
            <OwnerCustomerResponseCard reservation={ownerReservation} />
            {ownerReservation.reservationStatus === ReservationStatus.Pending ||
            ownerReservation.reservationStatus === ReservationStatus.AlternativeProposed ? (
              <OwnerReservationResponsePanel
                reservation={ownerReservation}
                response={response}
                readOnly={ownerReservation.reservationStatus !== ReservationStatus.Pending}
                onPropose={ownerReservation.reservationStatus === ReservationStatus.Pending
                  ? actions.propose
                  : undefined}
                onDecline={ownerReservation.reservationStatus === ReservationStatus.Pending
                  ? actions.decline
                  : undefined}
                declinePending={actions.isPending}
                declineError={actions.isError}
                proposePending={actions.isPending}
                proposeError={actions.isError}
              />
            ) : null}
            {actionContent && PrimaryActionIcon ? (
              <Button
                color="warmCoral"
                radius="sm"
                leftSection={<PrimaryActionIcon size={18} />}
                loading={actionPending}
                onClick={runPrimaryAction}
              >
                {actionContent.label}
              </Button>
            ) : (
              <Text size="sm" c={uiColors.textSecondary}>
                {t("operations.noAction")}
              </Text>
            )}
            {canTerminate ? (
              <Group grow>
                <Button
                  variant="outline"
                  color="orange"
                  leftSection={<IconUserX size={18} />}
                  disabled={actionPending}
                  onClick={() => {
                    actions.reset();
                    setNoShowOpened(true);
                  }}
                >
                  {ownerT("menu.noShow")}
                </Button>
                <Button
                  variant="outline"
                  color="red"
                  leftSection={<IconX size={18} />}
                  disabled={actionPending}
                  onClick={() => {
                    actions.reset();
                    setCancelOpened(true);
                  }}
                >
                  {ownerT("menu.cancel")}
                </Button>
              </Group>
            ) : null}
          </Stack>
        </DetailCard>

        <Grid>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <DetailCard title={t("reservation.title")}>
              <DetailRow label={t("reservation.date")} value={formattedDate} />
              <DetailRow label={t("reservation.time")} value={reservation.time} />
              <DetailRow
                label={t("reservation.partySize")}
                value={t("reservation.guests", { count: reservation.partySize })}
              />
              <DetailRow
                label={t("reservation.request")}
                value={reservation.request || t("notAvailable")}
              />
            </DetailCard>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 6 }}>
            <DetailCard title={t("customer.title")}>
              <DetailRow label={t("customer.name")} value={reservation.customer} />
              <DetailRow
                label={t("customer.phone")}
                value={reservation.phone || t("notAvailable")}
              />
              <DetailRow
                label={t("customer.email")}
                value={reservation.email || t("notAvailable")}
              />
              <DetailRow
                label={t("customer.store")}
                value={settingsQuery.data?.name ?? t("notAvailable")}
              />
            </DetailCard>
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <DetailCard title={t("checkIn.title")}>
              <DetailRow
                label={t("checkIn.status")}
                value={reservationsT(`checkIn.${reservation.checkIn}`)}
              />
              <DetailRow
                label={t("checkIn.method")}
                value={t("notAvailable")}
              />
            </DetailCard>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <DetailCard title={t("history.title")}>
              <DetailRow
                label={t("history.currentStatus")}
                value={reservationsT(`statuses.${reservation.status}`)}
              />
            </DetailCard>
          </Grid.Col>
        </Grid>

        <Modal
          opened={noShowOpened}
          onClose={() => setNoShowOpened(false)}
          title={ownerT("noShow.title", { guest: ownerReservation.guestName })}
          centered
        >
          <Stack gap="md">
            <Text size="sm" c={uiColors.textSecondary}>
              {ownerT("noShow.description")}
            </Text>
            {actions.isError ? (
              <Alert color="red" title={ownerT("noShow.error")} role="alert" />
            ) : null}
            <Group justify="flex-end">
              <Button
                variant="default"
                disabled={actions.isPending}
                onClick={() => setNoShowOpened(false)}
              >
                {ownerT("noShow.keep")}
              </Button>
              <Button
                color="orange"
                loading={actions.isPending}
                onClick={() => void markNoShow()}
              >
                {ownerT("noShow.confirm")}
              </Button>
            </Group>
          </Stack>
        </Modal>

        <Modal
          opened={cancelOpened}
          onClose={() => setCancelOpened(false)}
          title={ownerT("cancel.title")}
          centered
        >
          <Stack gap="md">
            <Text size="sm" c={uiColors.textSecondary}>
              {ownerT("cancel.description")}
            </Text>
            <Textarea
              label={ownerT("cancel.reason")}
              placeholder={ownerT("cancel.placeholder")}
              value={cancelReason}
              onChange={(event) => setCancelReason(event.currentTarget.value)}
              maxLength={500}
              minRows={3}
              autosize
              required
            />
            {actions.isError ? (
              <Alert color="red" title={ownerT("cancel.error")} role="alert" />
            ) : null}
            <Group justify="flex-end">
              <Button
                variant="default"
                disabled={actions.isPending}
                onClick={() => setCancelOpened(false)}
              >
                {ownerT("cancel.keep")}
              </Button>
              <Button
                color="red"
                loading={actions.isPending}
                disabled={!cancelReason.trim()}
                onClick={() => void cancelReservation()}
              >
                {ownerT("cancel.confirm")}
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </AdminShell>
  );
}

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card withBorder radius="sm" p={0} h="100%">
      <Text
        fw={800}
        px="md"
        py="sm"
        style={{ borderBottom: `1px solid ${uiColors.border}` }}
      >
        {title}
      </Text>
      <Stack gap={0}>{children}</Stack>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between" wrap="nowrap" px="md" py="sm">
      <Text size="sm" c={uiColors.textSecondary}>{label}</Text>
      <Text size="sm" fw={650} ta="right">{value}</Text>
    </Group>
  );
}
