"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Alert, Button, Card, Grid, Group, Stack, Text, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { StatusBadge } from "@/components/ui";
import { AdminShell } from "@/features/admin/components/admin-shell";
import {
  toAdminReservation,
  type AdminReservationStatus,
} from "@/features/admin/data/admin-reservations";
import { useOwnerReservation } from "@/features/owner/hooks/use-owner-reservations";
import { useOwnerSettings } from "@/features/owner/settings/hooks/use-owner-settings";
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
  const { reservation: ownerReservation, isPending, isError } =
    useOwnerReservation(id);
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
  const formattedDate = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
  }).format(new Date(`${reservation.date}T00:00:00`));

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
              <Button
                component={Link}
                href={`/owner/reservations/${reservation.id}`}
                color="warmCoral"
                radius="sm"
              >
                {t("manageReservation")}
              </Button>
            </Group>
          </Group>
        </Stack>

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
