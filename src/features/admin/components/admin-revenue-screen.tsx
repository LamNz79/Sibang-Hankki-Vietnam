"use client";

import {
  Box,
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
  IconChartPie,
  IconClockDollar,
  IconReceipt,
  IconWallet,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { uiColors } from "@/theme";

const metrics = [
  { key: "gmv", value: "₫68.4B", icon: IconWallet, tone: "success" },
  { key: "commission", value: "₫3.21B", icon: IconReceipt, tone: "success" },
  { key: "advertising", value: "₫624M", icon: IconChartPie, tone: "success" },
  { key: "settlement", value: "₫8.92B", icon: IconClockDollar, tone: "warning" },
] as const;

const monthlyTrend = [48, 56, 64, 61, 76, 86];
const months = ["mar", "apr", "may", "jun", "jul", "aug"] as const;
const revenueMix = [
  { key: "commission", value: 54, color: "#b85664" },
  { key: "advertising", value: 24, color: "#d1919b" },
  { key: "promotions", value: 13, color: "#efc184" },
  { key: "other", value: 9, color: "#91aaa3" },
] as const;

export function AdminRevenueScreen() {
  const t = useTranslations("Admin.revenue");

  return (
    <AdminShell>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Stack gap={3}>
            <Title order={1}>{t("title")}</Title>
            <Text c={uiColors.textSecondary}>{t("description")}</Text>
          </Stack>
          <Group gap="sm">
            <Button variant="default" radius="sm">{t("thisMonth")}</Button>
            <Button variant="default" radius="sm">{t("download")}</Button>
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="md">
          {metrics.map(({ key, value, icon: Icon, tone }) => (
            <Card key={key} withBorder radius="sm" p="lg">
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
              <Group
                justify="space-between"
                px="md"
                py="sm"
                style={{ borderBottom: `1px solid ${uiColors.border}` }}
              >
                <Text fw={800}>{t("trend.title")}</Text>
                <Text size="xs" c={uiColors.textSecondary}>{t("trend.period")}</Text>
              </Group>
              <Group align="flex-end" gap="sm" wrap="nowrap" h={300} px="md" pt="xl">
                {monthlyTrend.map((height, index) => (
                  <Stack
                    key={months[index]}
                    gap="xs"
                    align="center"
                    justify="flex-end"
                    h="100%"
                    style={{ flex: 1 }}
                  >
                    <Box
                      w="100%"
                      maw={90}
                      h={`${height}%`}
                      mih={24}
                      style={{
                        borderRadius: "3px 3px 0 0",
                        background: index % 2 === 0 ? "#b85664" : "#d1919b",
                      }}
                    />
                    <Text size="xs" c={uiColors.textSecondary}>
                      {t(`trend.months.${months[index]}`)}
                    </Text>
                  </Stack>
                ))}
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card withBorder radius="sm" p={0} h="100%">
              <Group
                justify="space-between"
                px="md"
                py="sm"
                style={{ borderBottom: `1px solid ${uiColors.border}` }}
              >
                <Text fw={800}>{t("mix.title")}</Text>
                <Text size="xs" c={uiColors.textSecondary}>{t("mix.period")}</Text>
              </Group>
              <Stack align="center" gap="lg" p="xl">
                <Box
                  w={160}
                  h={160}
                  style={{
                    borderRadius: "50%",
                    background:
                      "conic-gradient(#b85664 0 54%, #d1919b 54% 78%, #efc184 78% 91%, #91aaa3 91% 100%)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Box
                    w={96}
                    h={96}
                    bg="white"
                    style={{ borderRadius: "50%", display: "grid", placeItems: "center" }}
                  >
                    <Text fw={800}>₫3.84B</Text>
                  </Box>
                </Box>
                <Stack gap="xs" w="100%">
                  {revenueMix.map(({ key, value, color }) => (
                    <Group key={key} justify="space-between">
                      <Group gap="xs">
                        <Box w={10} h={10} bg={color} />
                        <Text size="xs">{t(`mix.items.${key}`)}</Text>
                      </Group>
                      <Text size="xs" fw={700}>{value}%</Text>
                    </Group>
                  ))}
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </AdminShell>
  );
}
