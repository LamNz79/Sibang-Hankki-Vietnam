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
      p={8}
      shadow="sm"
      style={{
        border: "1px solid rgba(207, 183, 145, 0.24)",
        background: "rgba(255,251,247,0.88)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 10px 28px rgba(100, 71, 34, 0.08)",
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
                  color={active ? "oligoTeal" : "sand"}
                  radius="xl"
                  size={42}
                  style={
                    active
                      ? { boxShadow: "0 8px 18px rgba(0, 116, 135, 0.24)" }
                      : { color: "#9c7a3b", background: "#f8efe1" }
                  }
                >
                  <Icon size={18} />
                </ThemeIcon>
                <Text size="xs" c={active ? "oligoTeal.8" : "#7b7367"} fw={active ? 700 : 500}>
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
