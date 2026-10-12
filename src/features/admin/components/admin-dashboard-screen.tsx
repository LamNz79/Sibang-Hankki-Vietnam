"use client";

import Link from "next/link";
import {
  Alert,
  Button,
  Card,
  Grid,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconCalendarX,
  IconCircleCheck,
  IconClipboardCheck,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { buildAdminDashboard } from "@/features/admin/data/admin-dashboard";
import { useOwnerReservations } from "@/features/owner/hooks/use-owner-reservations";
import { uiColors } from "@/theme";

const metricDefinitions = [
  { key: "bookings", icon: IconCalendarEvent, tone: "success" },
  { key: "checkedIn", icon: IconCircleCheck, tone: "success" },
  { key: "pending", icon: IconClipboardCheck, tone: "warning" },
  { key: "noShow", icon: IconCalendarX, tone: "error" },
] as const;

export function AdminDashboardScreen() {
  const t = useTranslations("Admin.dashboard");
  // shortcut: derive metrics client-side until the backend exposes restaurant analytics.
  const { reservations, isPending, isFetching, isError, refetch } =
    useOwnerReservations();
  const dashboard = buildAdminDashboard(reservations);
  const maxTrend = Math.max(...dashboard.weeklyTrend.map(({ count }) => count), 1);

  return (
    <AdminShell>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Stack gap={3}>
            <Title order={1}>{t("title")}</Title>
            <Text c={uiColors.textSecondary}>{t("description")}</Text>
          </Stack>
          <Button
            color="warmCoral"
            radius="sm"
            loading={isFetching}
            onClick={() => void refetch()}
          >
            {t("refresh")}
          </Button>
        </Group>

        {isError ? <Alert color="red" title={t("loadError")} /> : null}
        {isPending ? <Loader mx="auto" /> : null}

        {!isPending && !isError ? (
          <>
            <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="md">
              {metricDefinitions.map(({ key, icon: Icon, tone }) => (
                <Card key={key} withBorder radius="sm" p="lg">
                  <Group justify="space-between" align="flex-start">
                    <Stack gap="md">
                      <Text size="sm" c={uiColors.textSecondary}>
                        {t(`metrics.${key}.label`)}
                      </Text>
                      <Title order={2}>{dashboard.metrics[key]}</Title>
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

            <Grid gap="md">
              <Grid.Col span={{ base: 12, lg: 8 }}>
                <Card withBorder radius="sm" p={0} h="100%">
                  <Group justify="space-between" px="md" py="sm" style={{ borderBottom: `1px solid ${uiColors.border}` }}>
                    <Text fw={800}>{t("trend.title")}</Text>
                    <Text size="xs" c={uiColors.textSecondary}>{t("trend.period")}</Text>
                  </Group>
                  <Group align="flex-end" gap="sm" wrap="nowrap" h={250} px="md" pt="xl">
                    {dashboard.weeklyTrend.map(({ date, count }, index) => (
                      <Stack key={date} gap="xs" align="center" justify="flex-end" h="100%" style={{ flex: 1 }}>
                        <Text size="xs" fw={700}>{count}</Text>
                        <div
                          style={{
                            width: "100%",
                            maxWidth: 88,
                            height: `${Math.max((count / maxTrend) * 75, 3)}%`,
                            borderRadius: "3px 3px 0 0",
                            background: index % 2 === 0 ? "#b85664" : "#d1919b",
                          }}
                        />
                        <Text size="xs" c={uiColors.textSecondary}>
                          {date.slice(5).split("-").reverse().join("/")}
                        </Text>
                      </Stack>
                    ))}
                  </Group>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, lg: 4 }}>
                <Card withBorder radius="sm" p={0} h="100%">
                  <Group justify="space-between" px="md" py="sm" style={{ borderBottom: `1px solid ${uiColors.border}` }}>
                    <Text fw={800}>{t("pending.title")}</Text>
                    <Text size="xs" c={uiColors.textSecondary}>
                      {t("pending.total", { count: dashboard.pendingTotal })}
                    </Text>
                  </Group>
                  <Stack gap={0} p="md">
                    {dashboard.pendingReservations.length ? (
                      dashboard.pendingReservations.map((reservation) => (
                        <Group key={reservation.id} wrap="nowrap" py="sm">
                          <ThemeIcon variant="light" color="yellow" radius="sm" size={34}>
                            <IconClipboardCheck size={17} />
                          </ThemeIcon>
                          <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
                            <Text size="sm" fw={750} truncate>{reservation.guestName}</Text>
                            <Text size="xs" c={uiColors.textSecondary}>
                              {reservation.date.split("-").reverse().join("/")} · {reservation.time} · {reservation.partySize}
                            </Text>
                          </Stack>
                          <Button
                            component={Link}
                            href={`/admin/reservations/${reservation.id}`}
                            variant="subtle"
                            size="compact-xs"
                            color="warmCoral"
                          >
                            {t("pending.review")}
                          </Button>
                        </Group>
                      ))
                    ) : (
                      <Text py="xl" ta="center" c={uiColors.textSecondary}>
                        {t("pending.empty")}
                      </Text>
                    )}
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>
          </>
        ) : null}
      </Stack>
    </AdminShell>
  );
}
