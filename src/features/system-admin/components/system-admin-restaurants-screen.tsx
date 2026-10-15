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
import { IconDotsVertical, IconPlus, IconSearch } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { useFormatter, useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui";
import {
  archiveSystemAdminRestaurant,
  createSystemAdminRestaurant,
  getLocationProvinces,
  getSystemAdminRestaurant,
  getSystemAdminRestaurants,
  type SystemAdminRestaurant,
  type SystemAdminRestaurantInput,
  type SystemAdminRestaurantStatus,
  updateSystemAdminRestaurant,
  updateSystemAdminRestaurantStatus,
} from "@/features/system-admin/data/system-admin-directory";
import { RestaurantFormDialog } from "@/features/system-admin/components/restaurant-form-dialog";
import { StatusActionDialog } from "@/features/system-admin/components/status-action-dialog";
import { uiColors } from "@/theme";

const pageSizes = [10, 20, 50, 100];
const statusTones = {
  DRAFT: "neutral",
  PENDING: "warning",
  CHANGES_REQUESTED: "info",
  ACTIVE: "success",
  SUSPENDED: "error",
} as const;

type RestaurantStatusTarget = Extract<
  SystemAdminRestaurantStatus,
  "PENDING" | "ACTIVE" | "CHANGES_REQUESTED" | "SUSPENDED"
>;

type RestaurantStatusAction = {
  restaurant: SystemAdminRestaurant;
  target: RestaurantStatusTarget;
};

function actionKey(action: RestaurantStatusAction) {
  if (action.target === "PENDING") {
    return action.restaurant.approvalStatus === "DRAFT"
      ? "submit" as const
      : "resubmit" as const;
  }
  if (action.target === "CHANGES_REQUESTED") return "requestChanges" as const;
  if (action.target === "SUSPENDED") return "suspend" as const;
  return action.restaurant.approvalStatus === "PENDING"
    ? "approve" as const
    : "reactivate" as const;
}

export function SystemAdminRestaurantsScreen() {
  const t = useTranslations("SystemAdmin.restaurants");
  const format = useFormatter();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 350);
  const [status, setStatus] = useState<SystemAdminRestaurantStatus | "all">("all");
  const [provinceCode, setProvinceCode] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusAction, setStatusAction] = useState<RestaurantStatusAction | null>(null);
  const [editor, setEditor] = useState<string | null | undefined>(undefined);
  const [archiveTarget, setArchiveTarget] = useState<SystemAdminRestaurant | null>(null);
  const editing = typeof editor === "string";
  const restaurantsQuery = useQuery({
    queryKey: ["system-admin-restaurants", page, pageSize, debouncedQuery, status, provinceCode],
    queryFn: ({ signal }) => getSystemAdminRestaurants({
      page: page - 1,
      size: pageSize,
      query: debouncedQuery.trim() || undefined,
      status: status === "all" ? undefined : status,
      provinceCode: provinceCode ?? undefined,
    }, signal),
    placeholderData: (previous) => previous,
    retry: false,
  });
  const provincesQuery = useQuery({
    queryKey: ["location-provinces"],
    queryFn: ({ signal }) => getLocationProvinces(signal),
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  });
  const detailQuery = useQuery({
    queryKey: ["system-admin-restaurant", editor],
    queryFn: ({ signal }) => getSystemAdminRestaurant(editor as string, signal),
    enabled: editing,
    retry: false,
  });
  const statusMutation = useMutation({
    mutationFn: ({ restaurant, target }: RestaurantStatusAction) =>
      updateSystemAdminRestaurantStatus(restaurant.id, target),
    onSuccess: (_updated, action) => {
      setStatusAction(null);
      notifications.show({
        color: "teal",
        message: t(`actions.success.${actionKey(action)}`, {
          name: action.restaurant.name,
        }),
      });
    },
    onError: () => notifications.show({ color: "red", message: t("actions.error") }),
    onSettled: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: ["system-admin-restaurants"] }),
      queryClient.invalidateQueries({ queryKey: ["system-admin-dashboard"] }),
    ]),
  });
  const saveMutation = useMutation({
    mutationFn: (input: SystemAdminRestaurantInput) =>
      editing
        ? updateSystemAdminRestaurant(editor, input)
        : createSystemAdminRestaurant(input),
    onSuccess: (restaurant) => {
      setEditor(undefined);
      notifications.show({
        color: "teal",
        message: t(editing ? "form.updated" : "form.created", {
          name: restaurant.name,
        }),
      });
    },
    onError: () => notifications.show({ color: "red", message: t("form.saveError") }),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["system-admin-restaurants"] }),
  });
  const archiveMutation = useMutation({
    mutationFn: (restaurant: SystemAdminRestaurant) =>
      archiveSystemAdminRestaurant(restaurant.id),
    onSuccess: (_result, restaurant) => {
      setArchiveTarget(null);
      notifications.show({
        color: "teal",
        message: t("actions.archived", { name: restaurant.name }),
      });
    },
    onError: () => notifications.show({ color: "red", message: t("actions.archiveError") }),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["system-admin-restaurants"] }),
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
    {
      accessor: "provinceName",
      title: t("table.city"),
      width: 190,
      render: (restaurant) => restaurant.provinceName ?? restaurant.citySlug,
    },
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
    {
      accessor: "actions",
      title: t("table.actions"),
      width: 80,
      textAlign: "right",
      render: (restaurant) => {
        const targets: RestaurantStatusTarget[] =
          restaurant.approvalStatus === "PENDING"
            ? ["ACTIVE", "CHANGES_REQUESTED"]
            : restaurant.approvalStatus === "DRAFT" ||
                restaurant.approvalStatus === "CHANGES_REQUESTED"
              ? ["PENDING"]
            : restaurant.approvalStatus === "ACTIVE"
              ? ["SUSPENDED"]
              : restaurant.approvalStatus === "SUSPENDED"
                ? ["ACTIVE"]
                : [];
        return (
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                aria-label={t("actions.openMenu", { name: restaurant.name })}
              >
                <IconDotsVertical size={18} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => setEditor(restaurant.id)}>
                {t("actions.edit")}
              </Menu.Item>
              {targets.map((target) => (
                <Menu.Item
                  key={target}
                  color={target === "SUSPENDED" ? "red" : undefined}
                  onClick={() => setStatusAction({ restaurant, target })}
                >
                  {t(`actions.${actionKey({ restaurant, target })}`)}
                </Menu.Item>
              ))}
              {restaurant.approvalStatus === "DRAFT" ? (
                <>
                  <Menu.Divider />
                  <Menu.Item color="red" onClick={() => setArchiveTarget(restaurant)}>
                    {t("actions.archive")}
                  </Menu.Item>
                </>
              ) : null}
            </Menu.Dropdown>
          </Menu>
        );
      },
    },
  ];
  const resetPage = () => setPage(1);

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end">
        <Stack gap={3}>
          <Title order={1}>{t("title")}</Title>
          <Text c={uiColors.textSecondary}>{t("description")}</Text>
        </Stack>
        <Button leftSection={<IconPlus size={17} />} onClick={() => setEditor(null)}>
          {t("actions.create")}
        </Button>
      </Group>
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
          value={provinceCode === null ? null : String(provinceCode)}
          onChange={(value) => {
            setProvinceCode(value ? Number(value) : null);
            resetPage();
          }}
          placeholder={t("filters.city")}
          aria-label={t("filters.city")}
          data={(provincesQuery.data ?? []).map((province) => ({
            value: String(province.code),
            label: province.name,
          }))}
          searchable
          clearable
          disabled={provincesQuery.isLoading}
          w={220}
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
      <StatusActionDialog
        opened={statusAction !== null}
        title={statusAction
          ? t(`actions.dialog.${actionKey(statusAction)}.title`, {
              name: statusAction.restaurant.name,
            })
          : ""}
        description={statusAction
          ? t(`actions.dialog.${actionKey(statusAction)}.description`)
          : ""}
        cancelLabel={t("actions.cancel")}
        confirmLabel={statusAction ? t(`actions.${actionKey(statusAction)}`) : ""}
        danger={statusAction?.target === "SUSPENDED"}
        loading={statusMutation.isPending}
        onClose={() => {
          if (!statusMutation.isPending) setStatusAction(null);
        }}
        onConfirm={() => {
          if (statusAction) statusMutation.mutate(statusAction);
        }}
      />
      <StatusActionDialog
        opened={archiveTarget !== null}
        title={t("actions.archiveTitle", { name: archiveTarget?.name ?? "" })}
        description={t("actions.archiveDescription")}
        cancelLabel={t("actions.cancel")}
        confirmLabel={t("actions.archive")}
        danger
        loading={archiveMutation.isPending}
        onClose={() => {
          if (!archiveMutation.isPending) setArchiveTarget(null);
        }}
        onConfirm={() => {
          if (archiveTarget) archiveMutation.mutate(archiveTarget);
        }}
      />
      <RestaurantFormDialog
        key={`${editor ?? "create"}:${detailQuery.data?.updatedAt ?? "empty"}`}
        opened={editor !== undefined}
        restaurant={editing ? detailQuery.data ?? null : null}
        editing={editing}
        loading={editing && detailQuery.isLoading}
        loadError={editing && detailQuery.isError}
        saving={saveMutation.isPending}
        onClose={() => {
          if (!saveMutation.isPending) setEditor(undefined);
        }}
        onSubmit={(input) => saveMutation.mutate(input)}
      />
    </Stack>
  );
}
