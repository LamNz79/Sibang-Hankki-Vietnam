"use client";

import { useMemo, useState } from "react";
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
  IconBuildingStore,
  IconClockHour4,
  IconSearch,
  IconStar,
  IconXboxX,
} from "@tabler/icons-react";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui";
import { AdminShell } from "@/features/admin/components/admin-shell";
import {
  adminStoreRecords,
  filterAdminStores,
  type AdminStoreRecord,
  type AdminStoreRegion,
  type AdminStoreStatus,
} from "@/features/admin/data/admin-stores";
import { uiColors } from "@/theme";

const metrics = [
  { key: "active", value: "1,384", icon: IconBuildingStore, tone: "success" },
  { key: "pending", value: "7", icon: IconClockHour4, tone: "warning" },
  { key: "suspended", value: "19", icon: IconXboxX, tone: "error" },
  { key: "rating", value: "4.62", icon: IconStar, tone: "success" },
] as const;

const statusTones: Record<
  AdminStoreStatus,
  "success" | "warning" | "info" | "error" | "neutral"
> = {
  draft: "neutral",
  pending: "warning",
  changesRequested: "info",
  active: "success",
  suspended: "error",
};

export function AdminStoresScreen() {
  const t = useTranslations("Admin.stores");
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 500);
  const [status, setStatus] = useState<AdminStoreStatus | "all">("all");
  const [region, setRegion] = useState<AdminStoreRegion | "all">("all");
  const stores = useMemo(
    () => filterAdminStores(adminStoreRecords, debouncedQuery, status, region),
    [debouncedQuery, region, status],
  );
  const storeColumns: DataTableColumn<AdminStoreRecord>[] = [
    {
      accessor: "name",
      title: t("table.store"),
      width: 230,
      render: (store) => (
        <Stack gap={1}>
          <Text fw={750} size="sm">{store.name}</Text>
          <Text size="xs" c={uiColors.textSecondary}>{store.id}</Text>
        </Stack>
      ),
    },
    {
      accessor: "region",
      title: t("table.regionCategory"),
      width: 190,
      render: (store) =>
        `${t(`regions.${store.region}`)} · ${t(`categories.${store.category}`)}`,
    },
    { accessor: "manager", title: t("table.manager"), width: 170 },
    {
      accessor: "todayBookings",
      title: t("table.todayBookings"),
      width: 140,
      textAlign: "center",
      render: (store) => store.todayBookings ?? "-",
    },
    {
      accessor: "commission",
      title: t("table.commission"),
      width: 130,
      textAlign: "center",
      render: (store) =>
        store.commission === null ? t("underReview") : `${store.commission.toFixed(1)}%`,
    },
    {
      accessor: "status",
      title: t("table.status"),
      width: 150,
      textAlign: "center",
      render: (store) => (
        <StatusBadge tone={statusTones[store.status]}>
          {t(`statuses.${store.status}`)}
        </StatusBadge>
      ),
    },
    {
      accessor: "actions",
      title: "",
      width: 90,
      textAlign: "center",
      render: (store) => (
        <Button variant="subtle" color="warmCoral" size="compact-sm">
          {store.status === "active" ? t("details") : t("review")}
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
          <Button color="warmCoral" radius="sm">{t("addStore")}</Button>
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
              { value: "draft", label: t("statuses.draft") },
              { value: "pending", label: t("statuses.pending") },
              { value: "changesRequested", label: t("statuses.changesRequested") },
              { value: "active", label: t("statuses.active") },
              { value: "suspended", label: t("statuses.suspended") },
            ]}
            allowDeselect={false}
            w={210}
            radius="sm"
          />
          <Select
            value={region}
            onChange={(value) => setRegion((value ?? "all") as typeof region)}
            aria-label={t("filters.regionLabel")}
            data={[
              { value: "all", label: t("filters.region.all") },
              { value: "hoChiMinh", label: t("regions.hoChiMinh") },
              { value: "hanoi", label: t("regions.hanoi") },
              { value: "daNang", label: t("regions.daNang") },
            ]}
            allowDeselect={false}
            w={170}
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
          records={stores}
          idAccessor="id"
          noRecordsText={t("empty")}
          columns={storeColumns}
        />
      </Stack>
    </AdminShell>
  );
}
