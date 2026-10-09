"use client";

import { useMemo, useState } from "react";
import { Alert, Group, Stack, Text, TextInput, Title } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/features/admin/components/admin-shell";
import {
  buildOwnerGuests,
  type OwnerGuestSummary,
} from "@/features/owner/data/owner-guests";
import { useOwnerReservations } from "@/features/owner/hooks/use-owner-reservations";
import { uiColors } from "@/theme";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function AdminCustomersScreen() {
  const t = useTranslations("Admin.customers");
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { reservations, isFetching, isError } = useOwnerReservations();
  const allCustomers = useMemo(
    () => buildOwnerGuests(reservations),
    [reservations],
  );
  const customers = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase();
    if (!normalizedQuery) return allCustomers;
    return allCustomers.filter((customer) =>
      `${customer.name} ${customer.phone} ${customer.email ?? ""}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [allCustomers, debouncedQuery]);
  const records = customers.slice((page - 1) * pageSize, page * pageSize);

  const columns: DataTableColumn<OwnerGuestSummary>[] = [
    {
      accessor: "name",
      title: t("table.customer"),
      width: 260,
      render: (customer) => (
        <Stack gap={1}>
          <Text fw={750} size="sm">{customer.name}</Text>
          <Text size="xs" c={uiColors.textSecondary}>
            {customer.phone}{customer.email ? ` · ${customer.email}` : ""}
          </Text>
        </Stack>
      ),
    },
    {
      accessor: "reservations",
      title: t("table.reservations"),
      textAlign: "center",
    },
    {
      accessor: "visits",
      title: t("table.visits"),
      textAlign: "center",
    },
    {
      accessor: "noShows",
      title: t("table.noShows"),
      textAlign: "center",
    },
    {
      accessor: "lastReservation",
      title: t("table.lastReservation"),
      textAlign: "center",
      render: ({ lastReservation }) =>
        lastReservation.split("-").reverse().join("/"),
    },
  ];

  return (
    <AdminShell>
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
              setPage(1);
            }}
            placeholder={t("filters.searchPlaceholder")}
            aria-label={t("filters.searchLabel")}
            leftSection={<IconSearch size={16} />}
            style={{ flex: 1 }}
            miw={240}
            radius="sm"
          />
        </Group>

        {isError ? <Alert color="red" title={t("loadError")} /> : null}

        <DataTable
          withTableBorder
          borderRadius="sm"
          striped
          highlightOnHover
          minHeight={160}
          verticalAlign="center"
          horizontalSpacing="md"
          records={records}
          fetching={isFetching}
          page={page}
          onPageChange={setPage}
          totalRecords={customers.length}
          recordsPerPage={pageSize}
          onRecordsPerPageChange={(value) => {
            setPageSize(value);
            setPage(1);
          }}
          recordsPerPageOptions={PAGE_SIZE_OPTIONS}
          recordsPerPageLabel={t("pagination.rowsPerPage")}
          idAccessor="id"
          noRecordsText={t("empty")}
          columns={columns}
        />
      </Stack>
    </AdminShell>
  );
}
