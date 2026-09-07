"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Burger,
  Group,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconAd2,
  IconBell,
  IconBuildingStore,
  IconCalendarEvent,
  IconChartBar,
  IconLayoutDashboard,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { LanguageSelect } from "@/features/i18n";
import { uiColors } from "@/theme";

const adminNavigation = [
  { href: "/admin", labelKey: "dashboard", icon: IconLayoutDashboard },
  {
    href: "/admin/reservations",
    labelKey: "reservations",
    icon: IconCalendarEvent,
    count: 18,
  },
  { href: "/admin/customers", labelKey: "customers", icon: IconUsers },
  {
    href: "/admin/stores",
    labelKey: "stores",
    icon: IconBuildingStore,
    count: 7,
  },
  { href: "/admin/revenue", labelKey: "revenue", icon: IconChartBar },
  {
    href: "/admin/campaigns",
    labelKey: "campaigns",
    icon: IconAd2,
    count: 3,
  },
  { href: "/admin/settings", labelKey: "settings", icon: IconSettings },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("Admin.shell");
  const [navigationOpened, { toggle, close }] = useDisclosure(false);

  return (
    <AppShell
      layout="alt"
      header={{ height: 56 }}
      navbar={{
        width: 232,
        breakpoint: "md",
        collapsed: { mobile: !navigationOpened },
      }}
      padding={{ base: "md", md: 28 }}
      styles={{
        root: { background: uiColors.appBackground },
        main: { minHeight: "100dvh", background: uiColors.appBackground },
      }}
    >
      <AppShell.Header px={{ base: "md", md: 28 }}>
        <Group h="100%" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
            <Burger
              opened={navigationOpened}
              onClick={toggle}
              hiddenFrom="md"
              size="sm"
              aria-label={t("toggleNavigation")}
            />
            <TextInput
              leftSection={<IconSearch size={16} />}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchLabel")}
              w="100%"
              maw={440}
              radius="sm"
              visibleFrom="sm"
            />
          </Group>

          <Group gap="sm" wrap="nowrap">
            <LanguageSelect compact radius="sm" />
            <ActionIcon
              variant="default"
              size={36}
              radius="sm"
              aria-label={t("notifications")}
            >
              <IconBell size={18} />
            </ActionIcon>
            <Group gap="xs" wrap="nowrap" visibleFrom="sm">
              <Avatar color="warmCoral" variant="light" size={34}>
                AD
              </Avatar>
              <Stack gap={0}>
                <Text size="xs" fw={800}>
                  {t("adminName")}
                </Text>
                <Text size="10px" c={uiColors.textSecondary}>
                  {t("adminRole")}
                </Text>
              </Stack>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        style={{ background: "#332d2f", borderColor: "#332d2f" }}
      >
        <AppShell.Section>
          <Group gap="sm" px="xs" pb="xl" wrap="nowrap">
            <Avatar radius="md" color="warmCoral" size={38}>
              SH
            </Avatar>
            <Stack gap={0}>
              <Text c="white" fw={800} size="sm">
                Sibang Hankki
              </Text>
              <Text c="#cfc6c8" size="10px">
                ADMIN CONSOLE
              </Text>
            </Stack>
          </Group>
        </AppShell.Section>

        <AppShell.Section grow>
          <Stack gap={4}>
            {adminNavigation.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <UnstyledButton
                  key={item.href}
                  component={Link}
                  href={item.href}
                  onClick={close}
                  px="sm"
                  py={10}
                  style={{
                    borderRadius: 4,
                    color: active ? "white" : "#d8d1d3",
                    background: active ? "#b85664" : "transparent",
                  }}
                >
                  <Group gap="sm" wrap="nowrap">
                    <Icon size={18} />
                    <Text size="sm" fw={700} style={{ flex: 1 }}>
                      {t(`navigation.${item.labelKey}`)}
                    </Text>
                    {"count" in item ? (
                      <Box
                        px={7}
                        py={1}
                        style={{
                          borderRadius: 999,
                          background: "rgba(255, 255, 255, 0.16)",
                          fontSize: 10,
                        }}
                      >
                        {item.count}
                      </Box>
                    ) : null}
                  </Group>
                </UnstyledButton>
              );
            })}
          </Stack>
        </AppShell.Section>

        <AppShell.Section pt="md" style={{ borderTop: "1px solid #4c4346" }}>
          <Text c="#bfb6b8" size="10px" fw={700}>
            {t("adminOnly")}
          </Text>
          <Text c="#bfb6b8" size="10px">
            {t("auditNotice")}
          </Text>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
