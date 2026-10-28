"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Alert, Button, Card, Grid, Group, Stack, Text, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui";
import {
  formatPreferenceDate,
  useAccountPreferences,
} from "@/features/system-admin/components/account-preferences-context";
import {
  getSystemAdminReservation,
  getSystemAdminReservationDisplayStatus,
} from "@/features/system-admin/data/system-admin-reservations";
import { uiColors } from "@/theme";
import { restaurantTimeZone } from "@/lib/date-time";

const statusTones = {
  PENDING: "warning",
  CONFIRMED: "info",
  CHECKED_IN: "success",
  COMPLETED: "success",
  CANCELLED: "error",
  DECLINED: "error",
  NO_SHOW: "warning",
} as const;

export function SystemAdminReservationDetailScreen({ id }: { id: string }) {
  const t = useTranslations("SystemAdmin.reservations");
  const format = useFormatter();
  const preferences = useAccountPreferences();
  const reservationQuery = useQuery({
    queryKey: ["system-admin-reservation", id],
    queryFn: ({ signal }) => getSystemAdminReservation(id, signal),
    retry: false,
  });

  if (reservationQuery.isPending) return <Text fw={700}>{t("detail.loading")}</Text>;
  if (reservationQuery.isError || !reservationQuery.data) {
    return <Alert color="red" title={t("detail.loadError")} role="alert" />;
  }

  const reservation = reservationQuery.data;
  const displayStatus = getSystemAdminReservationDisplayStatus(reservation);
  const dateTime = (value: string) => {
    const date = new Date(value);
    return `${formatPreferenceDate(date, preferences)} ${format.dateTime(date, {
      timeStyle: "short",
      timeZone: restaurantTimeZone,
    })}`;
  };
  const fallback = (value: string | null) => value || t("detail.notAvailable");

  return (
    <Stack gap="xl">
      <Stack gap="sm">
        <Button
          component={Link}
          href="/system-admin/reservations"
          variant="subtle"
          color={uiColors.brandPrimary}
          size="compact-sm"
          leftSection={<IconArrowLeft size={16} />}
          w="fit-content"
        >
          {t("detail.back")}
        </Button>
        <Group justify="space-between" align="flex-end">
          <Stack gap={3} style={{ minWidth: 0 }}>
            <Title order={1}>{t("detail.title")}</Title>
            <Text c={uiColors.textSecondary} style={{ overflowWrap: "anywhere" }}>
              {reservation.reference} · {reservation.id}
            </Text>
          </Stack>
          <StatusBadge tone={statusTones[displayStatus]}>
            {t(`statuses.${displayStatus}`)}
          </StatusBadge>
        </Group>
      </Stack>

      <Grid>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <DetailCard title={t("detail.reservation.title")}>
            <DetailRow label={t("detail.reservation.start")} value={dateTime(reservation.startsAt)} />
            <DetailRow label={t("detail.reservation.end")} value={dateTime(reservation.endsAt)} />
            <DetailRow
              label={t("detail.reservation.partySize")}
              value={t("guests", { count: reservation.partySize })}
            />
            <DetailRow label={t("detail.reservation.request")} value={fallback(reservation.specialRequest)} />
            <DetailRow label={t("detail.reservation.preOrder")} value={fallback(reservation.preOrderNote)} />
          </DetailCard>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <DetailCard title={t("detail.customer.title")}>
            <DetailRow label={t("detail.customer.name")} value={reservation.customerName} />
            <DetailRow label={t("detail.customer.phone")} value={fallback(reservation.customerPhone)} />
            <DetailRow label={t("detail.customer.email")} value={fallback(reservation.customerEmail)} />
          </DetailCard>
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <DetailCard title={t("detail.restaurant.title")}>
            <DetailRow label={t("detail.restaurant.name")} value={reservation.restaurantName} />
            <DetailRow label={t("detail.restaurant.slug")} value={reservation.restaurantSlug} />
            <DetailRow label={t("detail.restaurant.id")} value={reservation.restaurantId} wrap />
          </DetailCard>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <DetailCard title={t("detail.status.title")}>
            <DetailRow label={t("detail.status.booking")} value={reservation.status} />
            <DetailRow label={t("detail.status.visit")} value={reservation.visitStatus ?? t("detail.notAvailable")} />
            <DetailRow label={t("detail.status.created")} value={dateTime(reservation.createdAt)} />
            <DetailRow label={t("detail.status.updated")} value={dateTime(reservation.updatedAt)} />
          </DetailCard>
        </Grid.Col>
      </Grid>

      {reservation.alternativeProposal ? (
        <DetailCard title={t("detail.proposal.title")}>
          <DetailRow label={t("detail.proposal.time")} value={dateTime(reservation.alternativeProposal.startsAt)} />
          <DetailRow label={t("detail.proposal.status")} value={reservation.alternativeProposal.status} />
          <DetailRow label={t("detail.proposal.initiator")} value={reservation.alternativeProposal.initiator} />
          <DetailRow label={t("detail.proposal.respondBy")} value={dateTime(reservation.alternativeProposal.respondBy)} />
          <DetailRow label={t("detail.proposal.message")} value={fallback(reservation.alternativeProposal.message)} />
        </DetailCard>
      ) : null}
    </Stack>
  );
}

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card withBorder radius="sm" p={0} h="100%">
      <Text fw={800} px="md" py="sm" style={{ borderBottom: `1px solid ${uiColors.border}` }}>
        {title}
      </Text>
      <Stack gap={0}>{children}</Stack>
    </Card>
  );
}

function DetailRow({
  label,
  value,
  wrap = false,
}: {
  label: string;
  value: string;
  wrap?: boolean;
}) {
  return (
    <Group justify="space-between" wrap="nowrap" px="md" py="sm">
      <Text size="sm" c={uiColors.textSecondary}>{label}</Text>
      <Text size="sm" fw={650} ta="right" style={wrap ? { overflowWrap: "anywhere" } : undefined}>
        {value}
      </Text>
    </Group>
  );
}
