"use client";

import Link from "next/link";
import {
  ActionIcon,
  Avatar,
  Box,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconChevronRight,
  IconClock,
  IconCoin,
  IconHeart,
  IconHistory,
  IconMap2,
  IconSettings,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { BottomNav, MobileShell } from "@/components/layout/customer";
import { SurfaceCard, WorkspaceSwitcher } from "@/components/ui";
import { LanguageSelect } from "@/features/i18n";
import { useCustomerReservations } from "@/features/reservations/hooks/use-customer-reservations";
import { uiColors } from "@/theme";

/** Configuration accepted by a row in the customer account menu. */
type AccountMenuItemProps = {
  href?: string;
  icon: Icon;
  iconBackground: string;
  iconColor: string;
  label: string;
  meta?: string;
};

/** Renders a linked or disabled account action with consistent visual treatment. */
function AccountMenuItem({
  href,
  icon: MenuIcon,
  iconBackground,
  iconColor,
  label,
  meta,
}: AccountMenuItemProps) {
  const content = (
    <Group gap="sm" wrap="nowrap" py="sm">
      <ThemeIcon
        size={36}
        radius="md"
        variant="filled"
        style={{
          flexShrink: 0,
          background: iconBackground,
          color: iconColor,
        }}
      >
        <MenuIcon size={18} />
      </ThemeIcon>

      <Text
        size="sm"
        fw={700}
        c={uiColors.textPrimary}
        style={{ flex: 1 }}
      >
        {label}
      </Text>

      {meta ? (
        <Text size="xs" c={uiColors.textSecondary}>
          {meta}
        </Text>
      ) : null}
      <IconChevronRight size={16} color={uiColors.textMuted} />
    </Group>
  );

  if (!href) {
    return (
      <UnstyledButton
        w="100%"
        disabled
        title={`${label} will be available in a later prototype`}
        style={{ opacity: 1, cursor: "default" }}
      >
        {content}
      </UnstyledButton>
    );
  }

  return (
    <Link href={href} style={{ color: "inherit", textDecoration: "none" }}>
      {content}
    </Link>
  );
}

/** Customer profile overview with reservation summary and account navigation. */
export function AccountScreen() {
  const reservations = useCustomerReservations();

  return (
    <MobileShell
      title="My"
      subtitle="Profile and benefits"
      headerAction={
        <Tooltip label="Account settings coming soon" position="bottom-end">
          <ActionIcon
            variant="light"
            color="gray"
            radius="xl"
            size={38}
            aria-label="Account settings coming soon"
          >
            <IconSettings size={19} />
          </ActionIcon>
        </Tooltip>
      }
      bottomNav={<BottomNav activePath="/my" />}
    >
      <SurfaceCard p="md">
        <Group gap="md" wrap="nowrap">
          <Avatar
            size={54}
            radius="xl"
            color="warmCoral"
            variant="light"
            styles={{ placeholder: { fontWeight: 800 } }}
          >
            ML
          </Avatar>
          <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
            <Text fw={800} c={uiColors.textPrimary}>
              Minh Lam
            </Text>
            <Text size="xs" c={uiColors.textSecondary}>
              Sibang Hankki member
            </Text>
          </Stack>
          <IconChevronRight size={18} color={uiColors.textMuted} />
        </Group>
      </SurfaceCard>

      <SurfaceCard tone="brand" p="md">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon
            size={38}
            radius="md"
            color="warmCoral"
            variant="light"
          >
            <IconCoin size={19} />
          </ThemeIcon>
          <Text size="sm" c={uiColors.textSecondary}>
            Dining points
          </Text>
          <Text fw={850} size="lg" c={uiColors.brandPrimary}>
            420
          </Text>
          <Box style={{ flex: 1 }} />
          <Text size="xs" fw={700} c={uiColors.brandPrimary}>
            History
          </Text>
          <IconChevronRight size={16} color={uiColors.brandPrimary} />
        </Group>
      </SurfaceCard>

      <SurfaceCard px="md" py={0}>
        <AccountMenuItem
          href="/reservations"
          icon={IconCalendarEvent}
          iconBackground={uiColors.detailDateSurface}
          iconColor={uiColors.detailDateText}
          label="My reservations"
          meta={`${reservations.length} upcoming`}
        />
        <Box h={1} ml={48} bg={uiColors.border} />
        <AccountMenuItem
          icon={IconHeart}
          iconBackground={uiColors.accentVipSurface}
          iconColor={uiColors.accentVipText}
          label="Saved restaurants"
          meta="8"
        />
        <Box h={1} ml={48} bg={uiColors.border} />
        <AccountMenuItem
          icon={IconMap2}
          iconBackground={uiColors.detailRequestSurface}
          iconColor={uiColors.detailRequestText}
          label="My dining map"
          meta="12 saved"
        />
        <Box h={1} ml={48} bg={uiColors.border} />
        <AccountMenuItem
          icon={IconHistory}
          iconBackground={uiColors.detailPreOrderSurface}
          iconColor={uiColors.detailPreOrderText}
          label="Visit history"
          meta="Write a review"
        />
      </SurfaceCard>

      <SurfaceCard p="md">
        <LanguageSelect />
      </SurfaceCard>

      <Stack gap="sm">
        <Text fw={800} size="lg" c={uiColors.textPrimary}>
          Recent visit
        </Text>
        <Link
          href="/restaurants/royal-pavilion"
          style={{ color: "inherit", textDecoration: "none" }}
        >
          <SurfaceCard p="sm">
            <Group gap="sm" wrap="nowrap">
              <Box
                w={68}
                h={58}
                style={{
                  flexShrink: 0,
                  borderRadius: 12,
                  background: `repeating-linear-gradient(135deg, ${uiColors.brandPrimarySoft} 0 8px, #ffffff 8px 16px)`,
                }}
              />
              <Stack gap={3} style={{ flex: 1, minWidth: 0 }}>
                <Text fw={750} size="sm" c={uiColors.textPrimary}>
                  The Royal Pavilion
                </Text>
                <Group gap={5} wrap="nowrap">
                  <IconClock size={14} color={uiColors.textSecondary} />
                  <Text size="xs" c={uiColors.textSecondary}>
                    1 visit · Review available
                  </Text>
                </Group>
              </Stack>
              <IconChevronRight size={17} color={uiColors.textMuted} />
            </Group>
          </SurfaceCard>
        </Link>
      </Stack>

      <SurfaceCard tone="brand" p="md">
        <WorkspaceSwitcher />
      </SurfaceCard>
    </MobileShell>
  );
}
