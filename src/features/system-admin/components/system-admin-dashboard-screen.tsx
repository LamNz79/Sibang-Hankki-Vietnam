"use client";

import Link from "next/link";
import {
  Alert,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconBuildingStore,
  IconClockHour4,
  IconLink,
  IconUsers,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui";
import {
  getSystemAdminRestaurantAssignments,
  getSystemAdminRestaurants,
  getSystemAdminUsers,
} from "@/features/system-admin/data/system-admin-directory";
import { uiColors } from "@/theme";

export function SystemAdminDashboardScreen() {
  const t = useTranslations("SystemAdmin.dashboard");
  const usersQuery = useQuery({
    queryKey: ["system-admin-dashboard", "users"],
    queryFn: ({ signal }) => getSystemAdminUsers({ page: 0, size: 1 }, signal),
    retry: false,
  });
  const restaurantsQuery = useQuery({
    queryKey: ["system-admin-dashboard", "restaurants"],
    queryFn: ({ signal }) => getSystemAdminRestaurants({ page: 0, size: 1 }, signal),
    retry: false,
  });
  const activeRestaurantsQuery = useQuery({
    queryKey: ["system-admin-dashboard", "restaurants", "ACTIVE"],
    queryFn: ({ signal }) => getSystemAdminRestaurants({
      page: 0,
      size: 1,
      status: "ACTIVE",
    }, signal),
    retry: false,
  });
  const pendingRestaurantsQuery = useQuery({
    queryKey: ["system-admin-dashboard", "restaurants", "PENDING"],
    queryFn: ({ signal }) => getSystemAdminRestaurants({
      page: 0,
      size: 5,
      status: "PENDING",
    }, signal),
    retry: false,
  });
  const assignmentsQuery = useQuery({
    queryKey: ["system-admin-dashboard", "assignments"],
    queryFn: ({ signal }) => getSystemAdminRestaurantAssignments({
      page: 0,
      size: 1,
    }, signal),
    retry: false,
  });
  const queries = [
    usersQuery,
    restaurantsQuery,
    activeRestaurantsQuery,
    pendingRestaurantsQuery,
    assignmentsQuery,
  ];
  const hasError = queries.some((query) => query.isError);
  const loading = queries.some((query) => query.isLoading);
  const metrics = [
    {
      key: "users",
      value: usersQuery.data?.totalElements,
      detail: t("metrics.users.detail"),
      href: "/system-admin/users",
      icon: IconUsers,
    },
    {
      key: "restaurants",
      value: restaurantsQuery.data?.totalElements,
      detail: t("metrics.restaurants.detail", {
        count: activeRestaurantsQuery.data?.totalElements ?? 0,
      }),
      href: "/system-admin/restaurants",
      icon: IconBuildingStore,
    },
    {
      key: "pending",
      value: pendingRestaurantsQuery.data?.totalElements,
      detail: t("metrics.pending.detail"),
      href: "/system-admin/restaurants",
      icon: IconClockHour4,
    },
    {
      key: "assignments",
      value: assignmentsQuery.data?.totalElements,
      detail: t("metrics.assignments.detail"),
      href: "/system-admin/assignments",
      icon: IconLink,
    },
  ] as const;

  return (
    <Stack gap="xl">
      <Stack gap={3}>
        <Title order={1}>{t("title")}</Title>
        <Text c={uiColors.textSecondary}>{t("description")}</Text>
      </Stack>

      {hasError ? <Alert color="red" title={t("loadError")} /> : null}

      <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="md">
        {metrics.map(({ key, value, detail, href, icon: Icon }) => (
          <Card key={key} component={Link} href={href} withBorder p="lg" style={{ textDecoration: "none" }}>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Stack gap="sm">
                <Text size="sm" c={uiColors.textSecondary}>{t(`metrics.${key}.label`)}</Text>
                <Title order={2}>{loading || value === undefined ? "—" : value}</Title>
                <Text size="xs" c={uiColors.textSecondary}>{detail}</Text>
              </Stack>
              <ThemeIcon color="warmCoral" variant="light" size={40} radius="md">
                <Icon size={20} />
              </ThemeIcon>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <Card withBorder p="lg">
          <Group justify="space-between" mb="md">
            <Stack gap={1}>
              <Text fw={800}>{t("pending.title")}</Text>
              <Text size="xs" c={uiColors.textSecondary}>{t("pending.description")}</Text>
            </Stack>
            <Button component={Link} href="/system-admin/restaurants" variant="subtle" color="warmCoral">
              {t("viewAll")}
            </Button>
          </Group>
          <Stack gap="xs">
            {pendingRestaurantsQuery.data?.items.map((restaurant) => (
              <Group
                key={restaurant.id}
                justify="space-between"
                p="sm"
                style={{ border: `1px solid ${uiColors.border}`, borderRadius: 8 }}
              >
                <Stack gap={1}>
                  <Text fw={700} size="sm">{restaurant.name}</Text>
                  <Text size="xs" c={uiColors.textSecondary}>
                    {restaurant.provinceName ?? restaurant.citySlug}
                  </Text>
                </Stack>
                <StatusBadge tone="warning">{t("pending.status")}</StatusBadge>
              </Group>
            ))}
            {!pendingRestaurantsQuery.isLoading &&
            (pendingRestaurantsQuery.data?.items.length ?? 0) === 0 ? (
              <Text size="sm" c={uiColors.textSecondary}>{t("pending.empty")}</Text>
            ) : null}
          </Stack>
        </Card>

        <Card withBorder p="lg">
          <Stack gap={1} mb="md">
            <Text fw={800}>{t("quickActions.title")}</Text>
            <Text size="xs" c={uiColors.textSecondary}>{t("quickActions.description")}</Text>
          </Stack>
          <Stack gap="sm">
            <Button component={Link} href="/system-admin/users" variant="default" justify="space-between">
              {t("quickActions.users")}
            </Button>
            <Button component={Link} href="/system-admin/restaurants" variant="default" justify="space-between">
              {t("quickActions.restaurants")}
            </Button>
            <Button component={Link} href="/system-admin/assignments" variant="default" justify="space-between">
              {t("quickActions.assignments")}
            </Button>
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
