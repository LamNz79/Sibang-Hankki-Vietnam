import Link from "next/link";
import { Card, Group, Stack, Text, ThemeIcon, UnstyledButton } from "@mantine/core";
import {
  IconCalendarTime,
  IconHome2,
  IconMapSearch,
  IconUserCircle,
} from "@tabler/icons-react";
import { uiColors } from "@/theme";

const items = [
  { href: "/", label: "Home", icon: IconHome2 },
  { href: undefined, label: "Nearby", icon: IconMapSearch },
  { href: "/reservations", label: "Reservations", icon: IconCalendarTime },
  { href: "/my", label: "My", icon: IconUserCircle },
];

export type BottomNavProps = { activePath: string };

export function BottomNav({ activePath }: BottomNavProps) {
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
          const active = item.href ? activePath === item.href : false;
          const Icon = item.icon;

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
                {item.label}
              </Text>
            </Stack>
          );

          if (!item.href) {
            return (
              <UnstyledButton key={item.label} style={{ cursor: "default" }}>
                {content}
              </UnstyledButton>
            );
          }

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
