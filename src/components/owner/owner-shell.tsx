"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActionIcon,
  Box,
  Flex,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconBell,
  IconCalendarEvent,
  IconChevronLeft,
  IconHomeStats,
  IconSpeakerphone,
  IconUsers,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { uiColors } from "@/components/ui/theme-tokens";

type OwnerShellProps = {
  title: string;
  eyebrow?: string;
  backHref?: string;
  headerAction?: ReactNode;
  children: ReactNode;
  footerAction?: ReactNode;
  hideMobileNavigation?: boolean;
};

const navigation = [
  { href: "/owner", label: "Today", icon: IconHomeStats, exact: true },
  {
    href: "/owner/reservations",
    label: "Reservations",
    icon: IconCalendarEvent,
  },
  { href: "/owner/guests", label: "Guests", icon: IconUsers },
  { href: "/owner/marketing", label: "Marketing", icon: IconSpeakerphone },
];

function isActivePath(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

function OwnerBottomNavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof IconHomeStats;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        minWidth: 0,
        minHeight: 58,
        padding: "5px 4px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        borderRadius: 12,
        color: active ? uiColors.brandPrimary : uiColors.textSecondary,
        textDecoration: "none",
        fontWeight: active ? 750 : 600,
      }}
    >
      <Icon size={20} />
      <Text size="xs" fw="inherit" truncate>
        {label}
      </Text>
    </Link>
  );
}

export function OwnerShell({
  title,
  eyebrow,
  backHref,
  headerAction,
  children,
  footerAction,
  hideMobileNavigation = false,
}: OwnerShellProps) {
  const pathname = usePathname();

  return (
    <Box mih="100dvh" bg={uiColors.appBackground}>
      <Flex
        direction="column"
        w="100%"
        maw={560}
        h="100dvh"
        mx="auto"
        style={{
          overflow: "hidden",
          background: uiColors.surface,
          boxShadow: `0 0 36px ${uiColors.shadowSoft}`,
        }}
      >
        <Box
          component="header"
          px={16}
          pt="max(8px, env(safe-area-inset-top))"
          pb={8}
          style={{
            flexShrink: 0,
            zIndex: 20,
            background: "rgba(255,255,255,0.98)",
            borderBottom: `1px solid ${uiColors.border}`,
          }}
        >
          <Group h={48} gap="sm" wrap="nowrap">
            <Box w={40} miw={40}>
              {backHref ? (
                <Link
                  href={backHref}
                  aria-label="Go back"
                  style={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 999,
                    color: uiColors.textPrimary,
                    background: uiColors.surfaceMuted,
                    textDecoration: "none",
                  }}
                >
                  <IconChevronLeft size={21} />
                </Link>
              ) : null}
            </Box>

            <Stack gap={0} align="center" style={{ flex: 1, minWidth: 0 }}>
              {eyebrow ? (
                <Text size="xs" c={uiColors.textSecondary} truncate>
                  {eyebrow}
                </Text>
              ) : null}
              <Title
                order={1}
                size="h4"
                ta="center"
                lineClamp={1}
                c={uiColors.textPrimary}
              >
                {title}
              </Title>
            </Stack>

            <Box w={40} miw={40}>
              {headerAction ?? (
                <ActionIcon
                  variant="light"
                  color="gray"
                  radius="xl"
                  size={40}
                  aria-label="Notifications"
                >
                  <IconBell size={20} />
                </ActionIcon>
              )}
            </Box>
          </Group>
        </Box>

        <Box
          component="main"
          px={16}
          py={16}
          className="hide-scrollbar"
          style={{
            minHeight: 0,
            flex: 1,
            overflowY: "auto",
            background: uiColors.appBackground,
          }}
        >
          {children}
        </Box>

        {footerAction ? (
          <Box
            px={16}
            py={10}
            style={{
              flexShrink: 0,
              background: "rgba(255,255,255,0.98)",
              borderTop: `1px solid ${uiColors.border}`,
            }}
          >
            {footerAction}
          </Box>
        ) : null}

        {!hideMobileNavigation ? (
          <Box
            px={8}
            pt={5}
            pb="max(7px, env(safe-area-inset-bottom))"
            style={{
              flexShrink: 0,
              background: "rgba(255,255,255,0.98)",
              borderTop: `1px solid ${uiColors.border}`,
            }}
          >
            <Group grow gap={2} wrap="nowrap">
              {navigation.map((item) => (
                <OwnerBottomNavLink
                  key={item.href}
                  {...item}
                  active={isActivePath(pathname, item.href, item.exact)}
                />
              ))}
            </Group>
          </Box>
        ) : null}
      </Flex>
    </Box>
  );
}
