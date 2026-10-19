"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppShell,
  Avatar,
  Burger,
  Group,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBuildingStore,
  IconCalendarEvent,
  IconLayoutDashboard,
  IconLink,
  IconUsers,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { LanguageSelect } from "@/features/i18n";
import { uiColors } from "@/theme";

const navigation = [
  { href: "/system-admin", key: "dashboard", icon: IconLayoutDashboard },
  { href: "/system-admin/users", key: "users", icon: IconUsers },
  {
    href: "/system-admin/restaurants",
    key: "restaurants",
    icon: IconBuildingStore,
  },
  {
    href: "/system-admin/reservations",
    key: "reservations",
    icon: IconCalendarEvent,
  },
  { href: "/system-admin/assignments", key: "assignments", icon: IconLink },
] as const;

export function SystemAdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("SystemAdmin.shell");
  const [opened, { toggle, close }] = useDisclosure(false);

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 232,
        breakpoint: "md",
        collapsed: { mobile: !opened },
      }}
      padding={{ base: "md", md: 28 }}
      styles={{ main: { minHeight: "100dvh", background: uiColors.appBackground } }}
    >
      <AppShell.Header px={{ base: "md", md: 28 }}>
        <Group h="100%" justify="space-between">
          <Group gap="sm">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="md"
              size="sm"
              aria-label={t("toggleNavigation")}
            />
            <Text fw={850}>{t("title")}</Text>
          </Group>
          <Group gap="sm">
            <LanguageSelect compact radius="sm" />
            <Avatar color="warmCoral" variant="light" size={34}>
              SA
            </Avatar>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        style={{ background: "#332d2f", borderColor: "#332d2f" }}
      >
        <AppShell.Section>
          <Stack gap={0} px="xs" pb="xl">
            <Text c="white" fw={800}>
              Sibang Hankki
            </Text>
            <Text c="#cfc6c8" size="10px">
              SYSTEM ADMIN
            </Text>
          </Stack>
        </AppShell.Section>
        <AppShell.Section grow>
          <Stack gap={4}>
            {navigation.map(({ href, key, icon: Icon }) => {
              const active = href === "/system-admin"
                ? pathname === href
                : pathname.startsWith(href);
              return (
                <UnstyledButton
                  key={href}
                  component={Link}
                  href={href}
                  onClick={close}
                  px="sm"
                  py={10}
                  style={{
                    borderRadius: 4,
                    color: active ? "white" : "#d8d1d3",
                    background: active ? "#b85664" : "transparent",
                  }}
                >
                  <Group gap="sm">
                    <Icon size={18} />
                    <Text size="sm" fw={700}>
                      {t(`navigation.${key}`)}
                    </Text>
                  </Group>
                </UnstyledButton>
              );
            })}
          </Stack>
        </AppShell.Section>
        <AppShell.Section pt="md" style={{ borderTop: "1px solid #4c4346" }}>
          <Stack gap="sm">
            <LogoutButton />
            <Text c="#bfb6b8" size="10px">
              {t("adminOnly")}
            </Text>
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
