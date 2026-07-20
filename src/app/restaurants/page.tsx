import { Badge, Card, Group, Stack, Text, TextInput } from "@mantine/core";
import { IconMapPin, IconSearch } from "@tabler/icons-react";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { MobileShell } from "@/components/app-shell/mobile-shell";

const restaurants = [
  {
    name: "Seoul Garden BBQ",
    area: "District 1",
    type: "Korean BBQ",
    slot: "Earliest slot 18:30",
  },
  {
    name: "Hankki Hotpot House",
    area: "District 7",
    type: "Hotpot",
    slot: "Earliest slot 19:00",
  },
  {
    name: "Sora Izakaya",
    area: "Binh Thanh",
    type: "Japanese Dining",
    slot: "Earliest slot 20:00",
  },
];

export default function RestaurantsPage() {
  return (
    <MobileShell
      title="Restaurant List"
      subtitle="Browse, filter, and choose a place to reserve."
      showBack
      bottomNav={<BottomNav activePath="/restaurants" />}
    >
      <TextInput
        radius="xl"
        size="md"
        placeholder="Search restaurant or area"
        leftSection={<IconSearch size={16} />}
      />

      {restaurants.map((restaurant) => (
        <Card key={restaurant.name} radius="xl" p="lg" withBorder>
          <Stack gap="sm">
            <Group justify="space-between" align="flex-start">
              <Stack gap={2}>
                <Text fw={700}>{restaurant.name}</Text>
                <Text size="sm" c="dimmed">
                  {restaurant.type}
                </Text>
              </Stack>
              <Badge color="orange" variant="light">
                Popular
              </Badge>
            </Group>

            <Group gap={6}>
              <IconMapPin size={14} />
              <Text size="sm" c="dimmed">
                {restaurant.area}
              </Text>
            </Group>

            <Text size="sm">{restaurant.slot}</Text>
          </Stack>
        </Card>
      ))}
    </MobileShell>
  );
}
