"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AppShell,
  Avatar,
  Burger,
  Group,
  MantineProvider,
  Stack,
  Text,
  UnstyledButton,
  createTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBuildingStore,
  IconCalendarEvent,
  IconLayoutDashboard,
  IconLink,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, type CSSProperties, type ReactNode } from "react";
import { ChangePasswordButton } from "@/features/auth/components/change-password-button";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { getSessionUser } from "@/features/auth/data/session";
import { setLocale } from "@/i18n/actions";
import {
  AccountPreferencesProvider,
  accountAccentPalette,
} from "@/features/system-admin/components/account-preferences-context";
import {
  defaultAccountPreferences,
  getAccountPreferences,
} from "@/features/system-admin/data/account-preferences";
import { appTheme, uiColors } from "@/theme";

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
  { href: "/system-admin/preferences", key: "preferences", icon: IconSettings },
] as const;

export function SystemAdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("SystemAdmin.shell");
  const [opened, { toggle, close }] = useDisclosure(false);
  const session = useQuery({
    queryKey: ["auth-session"],
    queryFn: ({ signal }) => getSessionUser(signal),
    retry: false,
    staleTime: 5 * 60_000,
  });
  const preferencesQuery = useQuery({
    queryKey: ["account-preferences"],
    queryFn: ({ signal }) => getAccountPreferences(signal),
    retry: false,
    staleTime: 5 * 60_000,
  });
  const preferences = preferencesQuery.data ?? defaultAccountPreferences;
  useEffect(() => {
    if (preferencesQuery.data && preferences.locale !== locale) {
      void setLocale(preferences.locale).then(() => router.refresh());
    }
  }, [locale, preferences.locale, preferencesQuery.data, router]);
  const accountTheme = useMemo(() => createTheme({
    ...appTheme,
    primaryColor: "accountAccent",
    autoContrast: true,
    colors: {
      ...appTheme.colors,
      accountAccent: accountAccentPalette(preferences.themeColor),
    },
  }), [preferences.themeColor]);
  const userid = session.data?.userid ?? "SA";

  return (
    <AccountPreferencesProvider value={preferences}>
    <MantineProvider
      theme={accountTheme}
      cssVariablesSelector="#system-admin-theme"
      withGlobalClasses={false}
    >
    <div
      id="system-admin-theme"
      data-density={preferences.displayDensity.toLowerCase()}
      style={preferences.displayDensity === "COMPACT" ? {
        "--mantine-spacing-xl": "1rem",
        "--mantine-spacing-lg": "0.75rem",
        "--mantine-spacing-md": "0.625rem",
      } as CSSProperties : undefined}
    >
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 232,
        breakpoint: "md",
        collapsed: { mobile: !opened },
      }}
      padding={preferences.displayDensity === "COMPACT"
        ? { base: "sm", md: "md" }
        : { base: "md", md: 28 }}
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
            <Group gap="xs" wrap="nowrap" visibleFrom="sm">
              <Avatar variant="light" size={34}>
                {userid.slice(0, 2).toUpperCase()}
              </Avatar>
              <Stack gap={0}>
                <Text size="xs" fw={800}>{userid}</Text>
                <Text size="10px" c={uiColors.textSecondary}>SYSTEM ADMIN</Text>
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
                    background: active ? preferences.themeColor : "transparent",
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
            <ChangePasswordButton />
            <LogoutButton />
            <Text c="#bfb6b8" size="10px">
              {t("adminOnly")}
            </Text>
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main key={`${pathname}-${Object.values(preferences).join("-")}`}>
        {children}
      </AppShell.Main>
    </AppShell>
    </div>
    </MantineProvider>
    </AccountPreferencesProvider>
  );
}
