import { Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import {
  IconCalendarTime,
  IconHome2,
  IconMapSearch,
  IconUserCircle,
} from "@tabler/icons-react";

const items = [
  { href: "/", label: "Home", icon: IconHome2 },
  { href: "/restaurants", label: "Explore", icon: IconMapSearch },
  { href: "/reservation", label: "Book", icon: IconCalendarTime },
  { href: "/my-reservations", label: "My", icon: IconUserCircle },
];

export function BottomNav({ activePath }: { activePath: string }) {
  return (
    <Card radius="xl" p="sm" shadow="sm" className="border border-white/70 bg-white/92 backdrop-blur">
      <Group grow>
        {items.map((item) => {
          const active = activePath === item.href;
          const Icon = item.icon;

          return (
            <a key={item.href} href={item.href} className="no-underline">
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
