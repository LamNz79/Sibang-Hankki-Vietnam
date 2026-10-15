"use client";

import { useState } from "react";
import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Menu,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconDotsVertical, IconLink, IconSearch } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui";
import { RestaurantAssignmentDialog } from "@/features/system-admin/components/restaurant-assignment-dialog";
import { StatusActionDialog } from "@/features/system-admin/components/status-action-dialog";
import {
  createSystemAdminRestaurantAssignment,
  getSystemAdminRestaurantAssignments,
  getSystemAdminRestaurants,
  getSystemAdminUsers,
  removeSystemAdminRestaurantAssignment,
  type SystemAdminRestaurantAssignment,
  type SystemAdminRestaurantAssignmentInput,
  type SystemAdminRestaurantAssignmentRole,
  updateSystemAdminRestaurantAssignment,
} from "@/features/system-admin/data/system-admin-directory";
import { uiColors } from "@/theme";

const pageSizes = [10, 20, 50, 100];

export function SystemAdminAssignmentsScreen() {
  const t = useTranslations("SystemAdmin.assignments");
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 350);
  const [role, setRole] = useState<SystemAdminRestaurantAssignmentRole | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [editor, setEditor] = useState<"create" | SystemAdminRestaurantAssignment | null>(null);
  const [removing, setRemoving] = useState<SystemAdminRestaurantAssignment | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [restaurantSearch, setRestaurantSearch] = useState("");
  const [debouncedUserSearch] = useDebouncedValue(userSearch, 250);
  const [debouncedRestaurantSearch] = useDebouncedValue(restaurantSearch, 250);

  const assignmentsQuery = useQuery({
    queryKey: ["system-admin-assignments", page, pageSize, debouncedQuery, role],
    queryFn: ({ signal }) => getSystemAdminRestaurantAssignments({
      page: page - 1,
      size: pageSize,
      query: debouncedQuery.trim() || undefined,
      role: role === "all" ? undefined : role,
    }, signal),
    placeholderData: (previous) => previous,
    retry: false,
  });
  const usersQuery = useQuery({
    queryKey: ["system-admin-assignment-users", debouncedUserSearch],
    queryFn: ({ signal }) => getSystemAdminUsers({
      page: 0,
      size: 20,
      query: debouncedUserSearch.trim() || undefined,
      role: "CUSTOMER",
      status: "ACTIVE",
    }, signal),
    enabled: editor === "create",
    retry: false,
  });
  const restaurantsQuery = useQuery({
    queryKey: ["system-admin-assignment-restaurants", debouncedRestaurantSearch],
    queryFn: ({ signal }) => getSystemAdminRestaurants({
      page: 0,
      size: 20,
      query: debouncedRestaurantSearch.trim() || undefined,
    }, signal),
    enabled: editor !== null,
    retry: false,
  });

  const refresh = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: ["system-admin-assignments"] }),
    queryClient.invalidateQueries({ queryKey: ["system-admin-users"] }),
  ]);
  const saveMutation = useMutation({
    mutationFn: (input: SystemAdminRestaurantAssignmentInput) =>
      editor === "create"
        ? createSystemAdminRestaurantAssignment(input)
        : updateSystemAdminRestaurantAssignment(editor!.userId, input),
    onSuccess: (assignment) => {
      setEditor(null);
      notifications.show({
        color: "teal",
        message: t("actions.saved", { name: assignment.name }),
      });
    },
    onError: () => notifications.show({ color: "red", message: t("actions.saveError") }),
    onSettled: refresh,
  });
  const removeMutation = useMutation({
    mutationFn: (assignment: SystemAdminRestaurantAssignment) =>
      removeSystemAdminRestaurantAssignment(assignment.userId),
    onSuccess: (_result, assignment) => {
      setRemoving(null);
      notifications.show({
        color: "teal",
        message: t("actions.removed", { name: assignment.name }),
      });
    },
    onError: () => notifications.show({ color: "red", message: t("actions.removeError") }),
    onSettled: refresh,
  });

  const columns: DataTableColumn<SystemAdminRestaurantAssignment>[] = [
    {
      accessor: "name",
      title: t("table.user"),
      width: 250,
      render: (assignment) => (
        <Stack gap={1}>
          <Text fw={750} size="sm">{assignment.name}</Text>
          <Text size="xs" c={uiColors.textSecondary}>@{assignment.userid}</Text>
        </Stack>
      ),
    },
    {
      accessor: "restaurantName",
      title: t("table.restaurant"),
      width: 280,
      render: (assignment) => (
        <Stack gap={1}>
          <Text fw={650} size="sm">{assignment.restaurantName}</Text>
          <Text size="xs" c={uiColors.textSecondary}>{assignment.restaurantSlug}</Text>
        </Stack>
      ),
    },
    {
      accessor: "role",
      title: t("table.role"),
      width: 120,
      render: (assignment) => (
        <StatusBadge tone={assignment.role === "OWNER" ? "brand" : "info"}>
          {t(`roles.${assignment.role}`)}
        </StatusBadge>
      ),
    },
    {
      accessor: "restaurantStatus",
      title: t("table.restaurantStatus"),
      width: 170,
      render: (assignment) => t(`restaurantStatuses.${assignment.restaurantStatus}`),
    },
    {
      accessor: "actions",
      title: t("table.actions"),
      width: 80,
      textAlign: "right",
      render: (assignment) => (
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" aria-label={t("actions.openMenu", { name: assignment.name })}>
              <IconDotsVertical size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => setEditor(assignment)}>{t("actions.edit")}</Menu.Item>
            <Menu.Item color="red" onClick={() => setRemoving(assignment)}>
              {t("actions.remove")}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end">
        <Stack gap={3}>
          <Title order={1}>{t("title")}</Title>
          <Text c={uiColors.textSecondary}>{t("description")}</Text>
        </Stack>
        <Button leftSection={<IconLink size={17} />} color="warmCoral" onClick={() => setEditor("create")}>
          {t("actions.create")}
        </Button>
      </Group>
      <Group align="flex-end" gap="sm">
        <TextInput
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            setPage(1);
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
            setPage(1);
          }}
          data={[
            { value: "all", label: t("filters.allRoles") },
            { value: "OWNER", label: t("roles.OWNER") },
            { value: "STAFF", label: t("roles.STAFF") },
          ]}
          allowDeselect={false}
          aria-label={t("filters.role")}
          w={180}
        />
      </Group>
      {assignmentsQuery.isError ? <Alert color="red" title={t("loadError")} /> : null}
      <DataTable
        withTableBorder
        striped
        highlightOnHover
        minHeight={180}
        records={assignmentsQuery.data?.items ?? []}
        fetching={assignmentsQuery.isFetching}
        columns={columns}
        idAccessor="userId"
        page={page}
        onPageChange={setPage}
        totalRecords={assignmentsQuery.data?.totalElements ?? 0}
        recordsPerPage={pageSize}
        onRecordsPerPageChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
        recordsPerPageOptions={pageSizes}
        recordsPerPageLabel={t("pagination.rowsPerPage")}
        noRecordsText={t("empty")}
      />
      {editor !== null ? (
        <RestaurantAssignmentDialog
          key={editor === "create" ? "create" : editor.userId}
          opened
          assignment={editor === "create" ? null : editor}
          users={usersQuery.data?.items ?? []}
          restaurants={restaurantsQuery.data?.items ?? []}
          loadingOptions={usersQuery.isFetching || restaurantsQuery.isFetching}
          submitting={saveMutation.isPending}
          userSearch={userSearch}
          restaurantSearch={restaurantSearch}
          onUserSearchChange={setUserSearch}
          onRestaurantSearchChange={setRestaurantSearch}
          onClose={() => {
            if (!saveMutation.isPending) setEditor(null);
          }}
          onSubmit={(input) => saveMutation.mutate(input)}
        />
      ) : null}
      <StatusActionDialog
        opened={removing !== null}
        title={t("actions.removeTitle", { name: removing?.name ?? "" })}
        description={t("actions.removeDescription")}
        cancelLabel={t("actions.cancel")}
        confirmLabel={t("actions.remove")}
        danger
        loading={removeMutation.isPending}
        onClose={() => {
          if (!removeMutation.isPending) setRemoving(null);
        }}
        onConfirm={() => {
          if (removing) removeMutation.mutate(removing);
        }}
      />
    </Stack>
  );
}
