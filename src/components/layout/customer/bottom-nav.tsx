import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import {
  IconCalendarTime,
  IconHome2,
  IconShoppingBag,
  IconUserCircle,
} from "@tabler/icons-react";
import { uiColors } from "@/theme";

const items = [
  {
    href: "/",
    labelKey: "home",
    icon: IconHome2
  },
  {
    href: "/shop",
    labelKey: "shop",
    icon: IconShoppingBag
  },
  {
    href: "/reservations",
    labelKey: "reservations",
    icon: IconCalendarTime,
  },
  {
    href: "/my",
    labelKey: "my",
    icon: IconUserCircle
  },
] as const;

export type BottomNavProps = { activePath: string };

export function BottomNav({ activePath }: BottomNavProps) {
  const t = useTranslations("Navigation.customer");

  return (
    <Card
      radius="xl"
      p={8}
      shadow="sm"
      style={{
        background: uiColors.surfaceAlt,
        border: `1px solid ${uiColors.border}`,
        boxShadow: `0 8px 24px ${uiColors.shadowSoft}`,
      }}
    >
      <Group grow>
        {items.map((item) => {
          const active = activePath === item.href;
          const Icon = item.icon;
          const label = t(item.labelKey);

          const content = (
            <Stack gap={4} align="center">
              <ThemeIcon
                variant={active ? "filled" : "light"}
                color={active ? "warmCoral" : "gray"}
                radius="xl"
                size={42}
                style={
                  active
                    ? { boxShadow: `0 8px 18px ${uiColors.brandPrimaryShadow}` }
                    : { color: uiColors.textSecondary, background: uiColors.surfaceMuted }
                }
              >
                <Icon size={18} />
              </ThemeIcon>
              <Text size="xs" c={active ? uiColors.brandPrimary : uiColors.textSecondary} fw={active ? 700 : 500}>
                {label}
              </Text>
            </Stack>
          );

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ textDecoration: "none", display: "block" }}
            >
              {content}
            </Link>
          );
        })}
      </Group>
    </Card>
  );
}
