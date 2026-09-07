"use client";

import {
  Button,
  Card,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCalendarEvent,
  IconCash,
  IconCircleCheck,
  IconClipboardCheck,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { uiColors } from "@/theme";

const metrics = [
  { key: "bookings", value: "1,248", icon: IconCalendarEvent, tone: "success" },
  { key: "checkedIn", value: "914", icon: IconCircleCheck, tone: "success" },
  { key: "gmv", value: "₫2.84B", icon: IconCash, tone: "success" },
  { key: "pending", value: "25", icon: IconClipboardCheck, tone: "warning" },
] as const;

const weeklyTrend = [48, 62, 58, 72, 84, 96, 78];
const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const alerts = ["storeApproval", "noShowAppeal", "bannerEnding", "settlementReview"] as const;

export function AdminDashboardScreen() {
  const t = useTranslations("Admin.dashboard");

  return (
    <AdminShell>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Stack gap={3}>
            <Title order={1}>{t("title")}</Title>
            <Text c={uiColors.textSecondary}>{t("description")}</Text>
          </Stack>
          <Group gap="sm">
            <Button variant="default" radius="sm">
              {t("report")}
            </Button>
            <Button color="warmCoral" radius="sm">
              {t("refresh")}
            </Button>
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="md">
          {metrics.map(({ key, value, icon: Icon, tone }) => (
            <Card key={key} withBorder radius="md" p="lg">
              <Group justify="space-between" align="flex-start">
                <Stack gap="md">
                  <Text size="sm" c={uiColors.textSecondary}>
                    {t(`metrics.${key}.label`)}
                  </Text>
                  <Title order={2}>{value}</Title>
                  <Text
                    size="xs"
                    fw={700}
                    c={
                      tone === "success"
                        ? uiColors.statusSuccessText
                        : uiColors.statusErrorText
                    }
                  >
                    {t(`metrics.${key}.detail`)}
                  </Text>
                </Stack>
                <ThemeIcon color="warmCoral" variant="light" size={38} radius="md">
                  <Icon size={19} />
                </ThemeIcon>
              </Group>
            </Card>
          ))}
        </SimpleGrid>

        <Grid gap="md">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Card withBorder radius="md" p={0} h="100%">
              <Group justify="space-between" px="md" py="sm" style={{ borderBottom: `1px solid ${uiColors.border}` }}>
                <Text fw={800}>{t("trend.title")}</Text>
                <Text size="xs" c={uiColors.textSecondary}>{t("trend.period")}</Text>
              </Group>
              <Group align="flex-end" gap="sm" wrap="nowrap" h={250} px="md" pt="xl">
                {weeklyTrend.map((height, index) => (
                  <Stack key={days[index]} gap="xs" align="center" justify="flex-end" h="100%" style={{ flex: 1 }}>
                    <div
                      style={{
                        width: "100%",
                        maxWidth: 88,
                        height: `${height}%`,
                        minHeight: 24,
                        borderRadius: "5px 5px 0 0",
                        background: index % 2 === 0 ? "#b85664" : "#d1919b",
                      }}
                    />
                    <Text size="xs" c={uiColors.textSecondary}>{t(`trend.days.${days[index]}`)}</Text>
                  </Stack>
                ))}
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card withBorder radius="md" p={0} h="100%">
              <Group justify="space-between" px="md" py="sm" style={{ borderBottom: `1px solid ${uiColors.border}` }}>
                <Text fw={800}>{t("alerts.title")}</Text>
                <Button variant="subtle" size="compact-xs" color="warmCoral">{t("alerts.viewAll")}</Button>
              </Group>
              <Stack gap={0} p="md">
                {alerts.map((alert) => (
                  <Group key={alert} wrap="nowrap" py="sm" align="flex-start">
                    <ThemeIcon variant="light" color="warmCoral" radius="md" size={34}>
                      <IconAlertCircle size={17} />
                    </ThemeIcon>
                    <Stack gap={1} style={{ flex: 1 }}>
                      <Text size="sm" fw={750}>{t(`alerts.items.${alert}.title`)}</Text>
                      <Text size="xs" c={uiColors.textSecondary}>{t(`alerts.items.${alert}.detail`)}</Text>
                    </Stack>
                    <Text size="10px" c={uiColors.textSecondary}>{t(`alerts.items.${alert}.time`)}</Text>
                  </Group>
                ))}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </AdminShell>
  );
}
