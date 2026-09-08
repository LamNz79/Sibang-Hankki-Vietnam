"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconCalendarCheck,
  IconCalendarX,
  IconCircleCheck,
  IconSearch,
  IconUserQuestion,
} from "@tabler/icons-react";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { StatusBadge } from "@/components/ui";
import { AdminShell } from "@/features/admin/components/admin-shell";
import {
  adminReservationRecords,
  filterAdminReservations,
  type AdminReservationRecord,
  type AdminReservationStatus,
} from "@/features/admin/data/admin-reservations";
import { uiColors } from "@/theme";

const metrics = [
  { key: "confirmed", value: "1,248", icon: IconCalendarCheck, tone: "success" },
  { key: "checkedIn", value: "914", icon: IconCircleCheck, tone: "success" },
  { key: "cancelled", value: "86", icon: IconCalendarX, tone: "error" },
  { key: "noShow", value: "18", icon: IconUserQuestion, tone: "warning" },
] as const;

const statusTones: Record<AdminReservationStatus, "success" | "warning" | "info" | "error"> = {
  checkedIn: "success",
  noShowReview: "warning",
  confirmed: "info",
  cancelled: "error",
};

export function AdminReservationsScreen() {
  const t = useTranslations("Admin.reservations");
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 500);
  const [period, setPeriod] = useState<"today" | "last7Days" | "thisMonth">("today");
  const [status, setStatus] = useState<AdminReservationStatus | "all">("all");
  const reservations = useMemo(
    () => filterAdminReservations(adminReservationRecords, debouncedQuery, status, period),
    [debouncedQuery, period, status],
  );
  const reservationColumns: DataTableColumn<AdminReservationRecord>[] = [
    {
      accessor: "id",
      title: t("table.id"),
      width: 170,
      render: (reservation) => (
        <Stack gap={1}>
          <Text fw={750} size="sm">{reservation.id}</Text>
          <Text size="xs" c={uiColors.textSecondary}>
            {t(`channels.${reservation.channel}`)}
          </Text>
        </Stack>
      ),
    },
    { accessor: "customer", title: t("table.customer"), width: 160 },
    { accessor: "store", title: t("table.store"), width: 170 },
    {
      accessor: "time",
      title: t("table.dateParty"),
      width: 160,
      textAlign: "center",
      render: (reservation) =>
        t("table.slot", {
          time: reservation.time,
          count: reservation.partySize,
        }),
    },
    {
      accessor: "checkIn",
      title: t("table.checkIn"),
      width: 130,
      textAlign: "center",
      render: (reservation) => t(`checkIn.${reservation.checkIn}`),
    },
    {
      accessor: "status",
      title: t("table.status"),
      width: 150,
      textAlign: "center",
      render: (reservation) => (
        <StatusBadge tone={statusTones[reservation.status]}>
          {t(`statuses.${reservation.status}`)}
        </StatusBadge>
      ),
    },
    {
      accessor: "actions",
      title: "",
      width: 90,
      textAlign: "center",
      render: (reservation) => (
        <Button variant="subtle" color="warmCoral" size="compact-sm">
          {reservation.status === "noShowReview" ? t("resolve") : t("details")}
        </Button>
      ),
    },
  ];

  return (
    <AdminShell>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Stack gap={3}>
            <Title order={1}>{t("title")}</Title>
            <Text c={uiColors.textSecondary}>{t("description")}</Text>
          </Stack>
          <Button variant="default" radius="sm">{t("export")}</Button>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="md">
          {metrics.map(({ key, value, icon: Icon, tone }) => (
            <Card key={key} withBorder radius="sm" p="lg">
              <Group justify="space-between" align="flex-start">
                <Stack gap="md">
                  <Text size="sm" c={uiColors.textSecondary}>{t(`metrics.${key}.label`)}</Text>
                  <Title order={2}>{value}</Title>
                  <Text
                    size="xs"
                    fw={700}
                    c={
                      tone === "success"
                        ? uiColors.statusSuccessText
                        : tone === "error"
                          ? uiColors.statusErrorText
                          : uiColors.statusWarningText
                    }
                  >
                    {t(`metrics.${key}.detail`)}
                  </Text>
                </Stack>
                <ThemeIcon color="warmCoral" variant="light" size={38} radius="sm"><Icon size={19} /></ThemeIcon>
              </Group>
            </Card>
          ))}
        </SimpleGrid>

        <Group align="flex-end" gap="sm">
          <TextInput
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder={t("filters.searchPlaceholder")}
            aria-label={t("filters.searchLabel")}
            leftSection={<IconSearch size={16} />}
            style={{ flex: 1 }}
            miw={240}
            radius="sm"
          />
          <Select
            value={period}
            aria-label={t("filters.periodLabel")}
            onChange={(value) => setPeriod((value ?? "today") as typeof period)}
            data={[
              { value: "today", label: t("filters.period.today") },
              { value: "last7Days", label: t("filters.period.last7Days") },
              { value: "thisMonth", label: t("filters.period.thisMonth") },
            ]}
            allowDeselect={false}
            w={170}
            radius="sm"
          />
          <Select
            value={status}
            aria-label={t("filters.statusLabel")}
            onChange={(value) => setStatus((value ?? "all") as typeof status)}
            data={[
              { value: "all", label: t("filters.status.all") },
              { value: "confirmed", label: t("statuses.confirmed") },
              { value: "checkedIn", label: t("statuses.checkedIn") },
              { value: "cancelled", label: t("statuses.cancelled") },
              { value: "noShowReview", label: t("statuses.noShowReview") },
            ]}
            allowDeselect={false}
            w={210}
            radius="sm"
          />
        </Group>

        <DataTable
          withTableBorder
          borderRadius="sm"
          striped
          highlightOnHover
          minHeight={160}
          verticalAlign="center"
          horizontalSpacing="md"
          records={reservations}
          idAccessor="id"
          noRecordsText={t("empty")}
          columns={reservationColumns}
        />
      </Stack>
    </AdminShell>
  );
}
