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
  getSystemAdminUsers,
  type SystemAdminUser,
  type SystemAdminUserRole,
  type SystemAdminUserStatus,
} from "@/features/system-admin/data/system-admin-directory";
import { uiColors } from "@/theme";

const pageSizes = [10, 20, 50, 100];
const statusTones = {
  ACTIVE: "success",
  SUSPENDED: "warning",
  CLOSED: "error",
} as const;

export function SystemAdminUsersScreen() {
  const t = useTranslations("SystemAdmin.users");
  const format = useFormatter();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 350);
  const [role, setRole] = useState<SystemAdminUserRole | "all">("all");
  const [status, setStatus] = useState<SystemAdminUserStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const usersQuery = useQuery({
    queryKey: ["system-admin-users", page, pageSize, debouncedQuery, role, status],
    queryFn: ({ signal }) => getSystemAdminUsers({
      page: page - 1,
      size: pageSize,
      query: debouncedQuery.trim() || undefined,
      role: role === "all" ? undefined : role,
      status: status === "all" ? undefined : status,
    }, signal),
    placeholderData: (previous) => previous,
    retry: false,
  });
  const columns: DataTableColumn<SystemAdminUser>[] = [
    {
      accessor: "name",
      title: t("table.user"),
      width: 250,
      render: (user) => (
        <Stack gap={1}>
          <Text fw={750} size="sm">
            {user.name}
          </Text>
          <Text size="xs" c={uiColors.textSecondary}>
            @{user.userid}
          </Text>
        </Stack>
      ),
    },
    {
      accessor: "contact",
      title: t("table.contact"),
      width: 250,
      render: (user) => (
        <Stack gap={1}>
          <Text size="sm">{user.email ?? "-"}</Text>
          <Text size="xs" c={uiColors.textSecondary}>
            {user.phone ?? "-"}
          </Text>
        </Stack>
      ),
    },
    { accessor: "role", title: t("table.role"), width: 120 },
    {
      accessor: "status",
      title: t("table.status"),
      width: 130,
      render: (user) => (
        <StatusBadge tone={statusTones[user.status]}>
          {t(`statuses.${user.status}`)}
        </StatusBadge>
      ),
    },
    {
      accessor: "restaurantId",
      title: t("table.restaurant"),
      width: 220,
      render: (user) => user.restaurantId ?? "-",
    },
    {
      accessor: "createdAt",
      title: t("table.created"),
      width: 150,
      render: (user) =>
        format.dateTime(new Date(user.createdAt), { dateStyle: "medium" }),
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
        <Select
          value={role}
          onChange={(value) => {
            setRole((value ?? "all") as typeof role);
            resetPage();
          }}
          data={["all", "CUSTOMER", "OWNER", "STAFF", "ADMIN"].map((value) => ({
            value,
            label: value === "all" ? t("filters.allRoles") : value,
          }))}
          allowDeselect={false}
          aria-label={t("filters.role")}
          w={160}
        />
        <Select
          value={status}
          onChange={(value) => {
            setStatus((value ?? "all") as typeof status);
            resetPage();
          }}
          data={["all", "ACTIVE", "SUSPENDED", "CLOSED"].map((value) => ({
            value,
            label: value === "all" ? t("filters.allStatuses") : t(`statuses.${value}`),
          }))}
          allowDeselect={false}
          aria-label={t("filters.status")}
          w={170}
        />
      </Group>
      {usersQuery.isError ? <Alert color="red" title={t("loadError")} /> : null}
      <DataTable
        withTableBorder
        striped
        highlightOnHover
        minHeight={180}
        records={usersQuery.data?.items ?? []}
        fetching={usersQuery.isFetching}
        columns={columns}
        idAccessor="id"
        page={page}
        onPageChange={setPage}
        totalRecords={usersQuery.data?.totalElements ?? 0}
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
