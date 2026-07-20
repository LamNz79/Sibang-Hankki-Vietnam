import { Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import {
  IconCalendarTime,
  IconHome2,
  IconMapSearch,
  IconUserCircle,
} from "@tabler/icons-react";

const items = [
  { href: "/", label: "Home", icon: IconHome2 },
  { href: "/restaurants", label: "Nearby", icon: IconMapSearch },
  { href: "/reservation", label: "Bookings", icon: IconCalendarTime },
  { href: "/my-reservations", label: "My", icon: IconUserCircle },
];

export function BottomNav({ activePath }: { activePath: string }) {
  return (
    <Card
      radius="xl"
      p="sm"
      shadow="sm"
      style={{
        border: "1px solid rgba(202, 181, 150, 0.26)",
        background: "rgba(255,248,241,0.95)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Group grow>
        {items.map((item) => {
          const active = activePath === item.href;
          const Icon = item.icon;

          return (
            <a key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <Stack gap={4} align="center">
                <ThemeIcon
                  variant={active ? "filled" : "light"}
                  color={active ? "teal" : "gray"}
                  radius="xl"
                  size={40}
                >
                  <Icon size={18} />
                </ThemeIcon>
                <Text size="xs" c={active ? "teal.8" : "dimmed"} fw={active ? 700 : 500}>
                  {item.label}
                </Text>
              </Stack>
            </a>
          );
        })}
      </Group>
    </Card>
  );
}
