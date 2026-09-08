"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui";
import { AdminShell } from "@/features/admin/components/admin-shell";
import {
  adminCustomerRecords,
  filterAdminCustomers,
  type AdminCustomerRecord,
  type AdminCustomerStatus,
  type AdminCustomerTier,
} from "@/features/admin/data/admin-customers";
import { uiColors } from "@/theme";

const statusTones: Record<
  AdminCustomerStatus,
  "success" | "warning" | "error" | "neutral"
> = {
  active: "success",
  review: "warning",
  restricted: "error",
  closed: "neutral",
};

export function AdminCustomersScreen() {
  const t = useTranslations("Admin.customers");
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 500);
  const [status, setStatus] = useState<AdminCustomerStatus | "all">("all");
  const [tier, setTier] = useState<AdminCustomerTier | "all">("all");
  const customers = useMemo(
    () => filterAdminCustomers(adminCustomerRecords, debouncedQuery, status, tier),
    [debouncedQuery, status, tier],
  );
  const customerColumns: DataTableColumn<AdminCustomerRecord>[] = [
    {
      accessor: "name",
      title: t("table.customer"),
      width: 260,
      render: (customer) => (
        <Group gap="xs" wrap="nowrap">
          <Stack gap={1}>
            <Text fw={750} size="sm">{customer.name}</Text>
            <Text size="xs" c={uiColors.textSecondary}>{customer.contact}</Text>
          </Stack>
          {customer.tier === "vip" ? (
            <StatusBadge tone="brand">{t("tiers.vip")}</StatusBadge>
          ) : null}
        </Group>
      ),
    },
    {
      accessor: "country",
      title: t("table.countryLanguage"),
      width: 170,
      render: (customer) => (
        <Stack gap={1}>
          <Text size="sm">{t(`countries.${customer.country}`)}</Text>
          <Text size="xs" c={uiColors.textSecondary}>
            {t(`languages.${customer.language}`)}
          </Text>
        </Stack>
      ),
    },
    {
      accessor: "reservations",
      title: t("table.reservationsVisits"),
      width: 160,
      textAlign: "center",
      render: (customer) => `${customer.reservations} / ${customer.visits}`,
    },
    {
      accessor: "noShows",
      title: t("table.noShows"),
      width: 100,
      textAlign: "center",
    },
    {
      accessor: "joined",
      title: t("table.joined"),
      width: 130,
      textAlign: "center",
    },
    {
      accessor: "status",
      title: t("table.status"),
      width: 130,
      textAlign: "center",
      render: (customer) => (
        <StatusBadge tone={statusTones[customer.status]}>
          {t(`statuses.${customer.status}`)}
        </StatusBadge>
      ),
    },
    {
      accessor: "actions",
      title: "",
      width: 90,
      textAlign: "center",
      render: () => (
        <Button variant="subtle" color="warmCoral" size="compact-sm">
          {t("details")}
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
          <Button variant="default" radius="sm">
            {t("export")}
          </Button>
        </Group>

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
            value={status}
            onChange={(value) => setStatus((value ?? "all") as typeof status)}
            aria-label={t("filters.statusLabel")}
            data={[
              { value: "all", label: t("filters.status.all") },
              { value: "active", label: t("statuses.active") },
              { value: "review", label: t("statuses.review") },
              { value: "restricted", label: t("statuses.restricted") },
              { value: "closed", label: t("statuses.closed") },
            ]}
            allowDeselect={false}
            w={180}
            radius="sm"
          />
          <Select
            value={tier}
            onChange={(value) => setTier((value ?? "all") as typeof tier)}
            aria-label={t("filters.tierLabel")}
            data={[
              { value: "all", label: t("filters.tier.all") },
              { value: "regular", label: t("tiers.regular") },
              { value: "vip", label: t("tiers.vip") },
            ]}
            allowDeselect={false}
            w={150}
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
          records={customers}
          idAccessor="id"
          noRecordsText={t("empty")}
          columns={customerColumns}
        />

        {customers.length > 0 ? (
          <Text size="xs" c={uiColors.textSecondary}>
            {t("resultCount", { count: customers.length })}
          </Text>
        ) : null}
      </Stack>
    </AdminShell>
  );
}
