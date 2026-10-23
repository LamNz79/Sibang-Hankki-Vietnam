"use client";

import { useState } from "react";
import { Button, Group, Loader, Modal, Select, Stack, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import type {
  SystemAdminRestaurant,
  SystemAdminRestaurantAssignment,
  SystemAdminRestaurantAssignmentInput,
  SystemAdminRestaurantAssignmentRole,
  SystemAdminUser,
} from "@/features/system-admin/data/system-admin-directory";
import { uiColors } from "@/theme";

type Props = {
  opened: boolean;
  assignment: SystemAdminRestaurantAssignment | null;
  users: SystemAdminUser[];
  restaurants: SystemAdminRestaurant[];
  loadingOptions: boolean;
  submitting: boolean;
  userSearch: string;
  restaurantSearch: string;
  onUserSearchChange: (value: string) => void;
  onRestaurantSearchChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (input: SystemAdminRestaurantAssignmentInput) => void;
};

export function RestaurantAssignmentDialog({
  opened,
  assignment,
  users,
  restaurants,
  loadingOptions,
  submitting,
  userSearch,
  restaurantSearch,
  onUserSearchChange,
  onRestaurantSearchChange,
  onClose,
  onSubmit,
}: Props) {
  const t = useTranslations("SystemAdmin.assignments");
  const [userId, setUserId] = useState<string | null>(assignment?.userId ?? null);
  const [restaurantId, setRestaurantId] = useState<string | null>(assignment?.restaurantId ?? null);
  const [role, setRole] = useState<SystemAdminRestaurantAssignmentRole>(assignment?.role ?? "OWNER");

  const userOptions = users.map((user) => ({
    value: user.id,
    label: `${user.name} (@${user.userid})`,
  }));
  if (assignment && !userOptions.some((option) => option.value === assignment.userId)) {
    userOptions.unshift({
      value: assignment.userId,
      label: `${assignment.name} (@${assignment.userid})`,
    });
  }
  const restaurantOptions = restaurants.map((restaurant) => ({
    value: restaurant.id,
    label: `${restaurant.name} (${restaurant.slug})`,
  }));
  if (assignment && !restaurantOptions.some((option) => option.value === assignment.restaurantId)) {
    restaurantOptions.unshift({
      value: assignment.restaurantId,
      label: `${assignment.restaurantName} (${assignment.restaurantSlug})`,
    });
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={assignment ? t("form.editTitle") : t("form.createTitle")}
      centered
      closeOnClickOutside={!submitting}
    >
      <Stack>
        <Text size="sm" c={uiColors.textSecondary}>
          {t("form.description")}
        </Text>
        <Select
          required
          searchable
          disabled={assignment !== null}
          label={t("form.user")}
          placeholder={t("form.userPlaceholder")}
          value={userId}
          onChange={setUserId}
          searchValue={userSearch}
          onSearchChange={onUserSearchChange}
          data={userOptions}
          nothingFoundMessage={t("form.noUsers")}
          rightSection={loadingOptions ? <Loader size={16} /> : null}
        />
        <Select
          required
          searchable
          label={t("form.restaurant")}
          placeholder={t("form.restaurantPlaceholder")}
          value={restaurantId}
          onChange={setRestaurantId}
          searchValue={restaurantSearch}
          onSearchChange={onRestaurantSearchChange}
          data={restaurantOptions}
          nothingFoundMessage={t("form.noRestaurants")}
          rightSection={loadingOptions ? <Loader size={16} /> : null}
        />
        <Select
          required
          label={t("form.role")}
          value={role}
          onChange={(value) => setRole((value ?? "OWNER") as SystemAdminRestaurantAssignmentRole)}
          allowDeselect={false}
          data={[
            { value: "OWNER", label: t("roles.OWNER") },
            { value: "STAFF", label: t("roles.STAFF") },
          ]}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose} disabled={submitting}>
            {t("actions.cancel")}
          </Button>
          <Button
            loading={submitting}
            disabled={!userId || !restaurantId}
            onClick={() => {
              if (userId && restaurantId) onSubmit({ userId, restaurantId, role });
            }}
          >
            {assignment ? t("actions.save") : t("actions.assign")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
