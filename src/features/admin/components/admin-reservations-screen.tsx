"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Alert,
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
  getAdminReservationDateRange,
  toAdminReservation,
  type AdminReservationPeriod,
  type AdminReservationRecord,
  type AdminReservationStatus,
} from "@/features/admin/data/admin-reservations";
import type { OwnerReservationPageStatus } from "@/features/owner/data/owner-reservations";
import { useOwnerReservationPage } from "@/features/owner/hooks/use-owner-reservations";
import { uiColors } from "@/theme";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const apiStatuses: Record<AdminReservationStatus, OwnerReservationPageStatus> = {
  pending: "PENDING",
  confirmed: "CONFIRMED",
  checkedIn: "CHECKED_IN",
  cancelled: "CANCELLED",
  declined: "DECLINED",
  noShow: "NO_SHOW",
};

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

export function AdminReservationsScreen() {
  const t = useTranslations("Admin.reservations");
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 500);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [period, setPeriod] = useState<AdminReservationPeriod>("all");
  const [status, setStatus] = useState<AdminReservationStatus | "all">("all");
  const dateRange = useMemo(
    () => getAdminReservationDateRange(period),
    [period],
  );
  const { data, isFetching, isError } = useOwnerReservationPage({
    page: page - 1,
    size: pageSize,
    query: debouncedQuery.trim() || undefined,
    status: status === "all" ? undefined : apiStatuses[status],
    ...dateRange,
  });
  const reservations = useMemo(
    () => (data?.reservations ?? []).map(toAdminReservation),
    [data?.reservations],
  );
  const metrics = [
    {
      key: "confirmed",
      value: data?.summary.confirmed ?? 0,
      icon: IconCalendarCheck,
      tone: "success",
    },
    {
      key: "checkedIn",
      value: data?.summary.checkedIn ?? 0,
      icon: IconCircleCheck,
      tone: "success",
    },
    {
      key: "cancelled",
      value: data?.summary.cancelled ?? 0,
      icon: IconCalendarX,
      tone: "error",
    },
    {
      key: "noShow",
      value: data?.summary.noShow ?? 0,
      icon: IconUserQuestion,
      tone: "warning",
    },
  ] as const;
  const reservationColumns: DataTableColumn<AdminReservationRecord>[] = [
    {
      accessor: "reference",
      title: t("table.id"),
      width: 190,
      render: (reservation) => (
        <Stack gap={1}>
          <Text fw={750} size="sm">{reservation.reference}</Text>
          <Text size="xs" c={uiColors.textSecondary}>{reservation.id}</Text>
        </Stack>
      ),
    },
    { accessor: "customer", title: t("table.customer"), width: 170 },
    {
      accessor: "date",
      title: t("table.dateParty"),
      width: 190,
      textAlign: "center",
      render: (reservation) =>
        t("table.slot", {
          date: reservation.date.split("-").reverse().join("/"),
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
        <Button
          component={Link}
          href={`/admin/reservations/${reservation.id}`}
          variant="subtle"
          color="warmCoral"
          size="compact-sm"
        >
          {t("details")}
        </Button>
      ),
    },
  ];

  return (
    <AdminShell>
      <Stack gap="xl">
        <Group align="flex-end">
          <Stack gap={3}>
            <Title order={1}>{t("title")}</Title>
            <Text c={uiColors.textSecondary}>{t("description")}</Text>
          </Stack>
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
                <ThemeIcon color="warmCoral" variant="light" size={38} radius="sm">
                  <Icon size={19} />
                </ThemeIcon>
              </Group>
            </Card>
          ))}
        </SimpleGrid>

        <Group align="flex-end" gap="sm">
          <TextInput
            value={query}
            onChange={(event) => {
              setQuery(event.currentTarget.value);
              setPage(1);
            }}
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
            onChange={(value) => {
              setPeriod((value ?? "all") as AdminReservationPeriod);
              setPage(1);
            }}
            data={[
              { value: "all", label: t("filters.period.all") },
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
            onChange={(value) => {
              setStatus((value ?? "all") as typeof status);
              setPage(1);
            }}
            data={[
              { value: "all", label: t("filters.status.all") },
              { value: "pending", label: t("statuses.pending") },
              { value: "confirmed", label: t("statuses.confirmed") },
              { value: "checkedIn", label: t("statuses.checkedIn") },
              { value: "cancelled", label: t("statuses.cancelled") },
              { value: "declined", label: t("statuses.declined") },
              { value: "noShow", label: t("statuses.noShow") },
            ]}
            allowDeselect={false}
            w={210}
            radius="sm"
          />
        </Group>

        {isError ? <Alert color="red" title={t("loadError")} role="alert" /> : null}

        <DataTable
          withTableBorder
          borderRadius="sm"
          striped
          highlightOnHover
          minHeight={160}
          verticalAlign="center"
          horizontalSpacing="md"
          records={reservations}
          fetching={isFetching}
          page={page}
          onPageChange={setPage}
          totalRecords={data?.totalElements ?? 0}
          recordsPerPage={pageSize}
          onRecordsPerPageChange={(value) => {
            setPageSize(value);
            setPage(1);
          }}
          recordsPerPageOptions={PAGE_SIZE_OPTIONS}
          recordsPerPageLabel={t("pagination.rowsPerPage")}
          idAccessor="id"
          noRecordsText={t("empty")}
          columns={reservationColumns}
        />
      </Stack>
    </AdminShell>
  );
}
