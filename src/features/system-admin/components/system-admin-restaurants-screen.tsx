"use client";

import { useState } from "react";
import { Alert, Group, Select, Stack, Text, TextInput, Title } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { useFormatter, useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui";
import {
  getSystemAdminRestaurants,
  type SystemAdminRestaurant,
  type SystemAdminRestaurantStatus,
} from "@/features/system-admin/data/system-admin-directory";
import { uiColors } from "@/theme";

const pageSizes = [10, 20, 50, 100];
const statusTones = {
  DRAFT: "neutral",
  PENDING: "warning",
  CHANGES_REQUESTED: "info",
  ACTIVE: "success",
  SUSPENDED: "error",
} as const;

export function SystemAdminRestaurantsScreen() {
  const t = useTranslations("SystemAdmin.restaurants");
  const format = useFormatter();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 350);
  const [status, setStatus] = useState<SystemAdminRestaurantStatus | "all">("all");
  const [citySlug, setCitySlug] = useState("");
  const [debouncedCity] = useDebouncedValue(citySlug, 350);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const restaurantsQuery = useQuery({
    queryKey: ["system-admin-restaurants", page, pageSize, debouncedQuery, status, debouncedCity],
    queryFn: ({ signal }) => getSystemAdminRestaurants({
      page: page - 1,
      size: pageSize,
      query: debouncedQuery.trim() || undefined,
      status: status === "all" ? undefined : status,
      citySlug: debouncedCity.trim() || undefined,
    }, signal),
    placeholderData: (previous) => previous,
    retry: false,
  });
  const columns: DataTableColumn<SystemAdminRestaurant>[] = [
    {
      accessor: "name",
      title: t("table.restaurant"),
      width: 260,
      render: (restaurant) => (
        <Stack gap={1}>
          <Text fw={750} size="sm">
            {restaurant.name}
          </Text>
          <Text size="xs" c={uiColors.textSecondary}>
            {restaurant.slug}
          </Text>
        </Stack>
      ),
    },
    { accessor: "citySlug", title: t("table.city"), width: 160 },
    {
      accessor: "location",
      title: t("table.location"),
      width: 220,
      render: (restaurant) =>
        [restaurant.area, restaurant.district].filter(Boolean).join(" · ") || "-",
    },
    {
      accessor: "approvalStatus",
      title: t("table.status"),
      width: 170,
      render: (restaurant) => (
        <StatusBadge tone={statusTones[restaurant.approvalStatus]}>
          {t(`statuses.${restaurant.approvalStatus}`)}
        </StatusBadge>
      ),
    },
    {
      accessor: "createdAt",
      title: t("table.created"),
      width: 150,
      render: (restaurant) =>
        format.dateTime(new Date(restaurant.createdAt), { dateStyle: "medium" }),
    },
  ];
  const resetPage = () => setPage(1);

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
          miw={240}
        />
        <TextInput
          value={citySlug}
          onChange={(event) => {
            setCitySlug(event.currentTarget.value);
            resetPage();
          }}
          placeholder={t("filters.city")}
          aria-label={t("filters.city")}
          w={180}
        />
        <Select
          value={status}
          onChange={(value) => {
            setStatus((value ?? "all") as typeof status);
            resetPage();
          }}
          data={["all", "DRAFT", "PENDING", "CHANGES_REQUESTED", "ACTIVE", "SUSPENDED"].map((value) => ({
            value,
            label: value === "all" ? t("filters.allStatuses") : t(`statuses.${value}`),
          }))}
          allowDeselect={false}
          aria-label={t("filters.status")}
          w={190}
        />
      </Group>
      {restaurantsQuery.isError ? <Alert color="red" title={t("loadError")} /> : null}
      <DataTable
        withTableBorder
        striped
        highlightOnHover
        minHeight={180}
        records={restaurantsQuery.data?.items ?? []}
        fetching={restaurantsQuery.isFetching}
        columns={columns}
        idAccessor="id"
        page={page}
        onPageChange={setPage}
        totalRecords={restaurantsQuery.data?.totalElements ?? 0}
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
