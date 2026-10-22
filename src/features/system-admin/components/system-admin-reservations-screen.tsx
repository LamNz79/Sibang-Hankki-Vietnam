"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, Button, Group, Select, Stack, Text, TextInput, Title } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { useFormatter, useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui";
import {
  formatPreferenceDate,
  useAccountPreferences,
} from "@/features/system-admin/components/account-preferences-context";
import { getSystemAdminRestaurants } from "@/features/system-admin/data/system-admin-directory";
import {
  getSystemAdminReservationDisplayStatus,
  getSystemAdminReservations,
  type SystemAdminReservation,
  type SystemAdminReservationFilterStatus,
} from "@/features/system-admin/data/system-admin-reservations";
import { uiColors } from "@/theme";

const pageSizes = [10, 20, 50, 100];
const statuses: SystemAdminReservationFilterStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "COMPLETED",
  "CANCELLED",
  "DECLINED",
  "NO_SHOW",
];
const statusTones = {
  PENDING: "warning",
  CONFIRMED: "info",
  CHECKED_IN: "success",
  COMPLETED: "success",
  CANCELLED: "error",
  DECLINED: "error",
  NO_SHOW: "warning",
} as const;

export function SystemAdminReservationsScreen() {
  const t = useTranslations("SystemAdmin.reservations");
  const format = useFormatter();
  const preferences = useAccountPreferences();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 350);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantSearch, setRestaurantSearch] = useState("");
  const [debouncedRestaurantSearch] = useDebouncedValue(restaurantSearch, 350);
  const [status, setStatus] = useState<SystemAdminReservationFilterStatus | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(preferences.tablePageSize);
  const reservationsQuery = useQuery({
    queryKey: [
      "system-admin-reservations",
      page,
      pageSize,
      debouncedQuery,
      restaurantId,
      status,
      dateFrom,
      dateTo,
    ],
    queryFn: ({ signal }) => getSystemAdminReservations({
      page: page - 1,
      size: pageSize,
      query: debouncedQuery.trim() || undefined,
      restaurantId: restaurantId ?? undefined,
      status: status === "all" ? undefined : status,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }, signal),
    placeholderData: (previous) => previous,
    retry: false,
  });
  const restaurantsQuery = useQuery({
    queryKey: ["system-admin-reservation-restaurants", debouncedRestaurantSearch],
    queryFn: ({ signal }) => getSystemAdminRestaurants({
      page: 0,
      size: 20,
      query: debouncedRestaurantSearch.trim() || undefined,
    }, signal),
    staleTime: 60_000,
    retry: false,
  });
  const resetPage = () => setPage(1);
  const columns: DataTableColumn<SystemAdminReservation>[] = [
    {
      accessor: "reference",
      title: t("table.reference"),
      width: 210,
      render: (reservation) => (
        <Stack gap={1} style={{ minWidth: 0 }}>
          <Text fw={750} size="sm" style={{ overflowWrap: "anywhere" }}>
            {reservation.reference}
          </Text>
          <Text size="xs" c={uiColors.textSecondary} style={{ overflowWrap: "anywhere" }}>
            {reservation.id}
          </Text>
        </Stack>
      ),
    },
    {
      accessor: "restaurantName",
      title: t("table.restaurant"),
      width: 210,
      render: (reservation) => (
        <Stack gap={1}>
          <Text size="sm" fw={700}>{reservation.restaurantName}</Text>
          <Text size="xs" c={uiColors.textSecondary}>{reservation.restaurantSlug}</Text>
        </Stack>
      ),
    },
    {
      accessor: "customerName",
      title: t("table.customer"),
      width: 180,
      render: (reservation) => (
        <Stack gap={1}>
          <Text size="sm">{reservation.customerName}</Text>
          <Text size="xs" c={uiColors.textSecondary}>
            {reservation.customerPhone ?? reservation.customerEmail ?? "-"}
          </Text>
        </Stack>
      ),
    },
    {
      accessor: "startsAt",
      title: t("table.schedule"),
      width: 190,
      render: (reservation) => (
        <Stack gap={1}>
          <Text size="sm">
            {formatPreferenceDate(new Date(reservation.startsAt), preferences)}
          </Text>
          <Text size="xs" c={uiColors.textSecondary}>
            {format.dateTime(new Date(reservation.startsAt), { timeStyle: "short" })}
            {" · "}{t("guests", { count: reservation.partySize })}
          </Text>
        </Stack>
      ),
    },
    {
      accessor: "status",
      title: t("table.status"),
      width: 145,
      render: (reservation) => {
        const displayStatus = getSystemAdminReservationDisplayStatus(reservation);
        return (
          <StatusBadge tone={statusTones[displayStatus]}>
            {t(`statuses.${displayStatus}`)}
          </StatusBadge>
        );
      },
    },
    {
      accessor: "actions",
      title: "",
      width: 90,
      textAlign: "right",
      render: (reservation) => (
        <Button
          component={Link}
          href={`/system-admin/reservations/${reservation.id}`}
          variant="subtle"
          size="compact-sm"
        >
          {t("details")}
        </Button>
      ),
    },
  ];

  return (
    <Stack gap="xl">
      <Stack gap={3}>
        <Title order={1}>{t("title")}</Title>
        <Text c={uiColors.textSecondary}>{t("description")}</Text>
      </Stack>

      <Group align="flex-end" gap="sm">
        <TextInput
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            resetPage();
          }}
          placeholder={t("filters.search")}
          aria-label={t("filters.search")}
          leftSection={<IconSearch size={16} />}
          style={{ flex: 1 }}
          miw={260}
        />
        <Select
          value={restaurantId}
          onChange={(value) => {
            setRestaurantId(value);
            resetPage();
          }}
          searchValue={restaurantSearch}
          onSearchChange={setRestaurantSearch}
          data={(restaurantsQuery.data?.items ?? []).map((restaurant) => ({
            value: restaurant.id,
            label: restaurant.name,
          }))}
          placeholder={t("filters.allRestaurants")}
          aria-label={t("filters.restaurant")}
          searchable
          clearable
          filter={({ options }) => options}
          nothingFoundMessage={t("filters.noRestaurants")}
          w={230}
        />
        <Select
          value={status}
          onChange={(value) => {
            setStatus((value ?? "all") as typeof status);
            resetPage();
          }}
          data={[
            { value: "all", label: t("filters.allStatuses") },
            ...statuses.map((value) => ({ value, label: t(`statuses.${value}`) })),
          ]}
          allowDeselect={false}
          aria-label={t("filters.status")}
          w={180}
        />
        <TextInput
          type="date"
          label={t("filters.dateFrom")}
          value={dateFrom}
          max={dateTo || undefined}
          onChange={(event) => {
            setDateFrom(event.currentTarget.value);
            resetPage();
          }}
          w={155}
        />
        <TextInput
          type="date"
          label={t("filters.dateTo")}
          value={dateTo}
          min={dateFrom || undefined}
          onChange={(event) => {
            setDateTo(event.currentTarget.value);
            resetPage();
          }}
          w={155}
        />
      </Group>

      {reservationsQuery.isError ? <Alert color="red" title={t("loadError")} /> : null}
      <DataTable
        withTableBorder
        striped
        highlightOnHover
        minHeight={180}
        records={reservationsQuery.data?.items ?? []}
        fetching={reservationsQuery.isFetching}
        columns={columns}
        idAccessor="id"
        page={page}
        onPageChange={setPage}
        totalRecords={reservationsQuery.data?.totalElements ?? 0}
        recordsPerPage={pageSize}
        onRecordsPerPageChange={(value) => {
          setPageSize(value);
          resetPage();
        }}
        recordsPerPageOptions={pageSizes}
        recordsPerPageLabel={t("pagination.rowsPerPage")}
        noRecordsText={t("empty")}
      />
    </Stack>
  );
}
