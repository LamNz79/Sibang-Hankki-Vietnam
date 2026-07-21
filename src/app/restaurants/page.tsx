import {
  Badge,
  Box,
  Card,
  Chip,
  Group,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconClock,
  IconMapPin,
  IconSearch,
  IconStarFilled,
  IconUsers,
} from "@tabler/icons-react";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { MobileShell } from "@/components/app-shell/mobile-shell";

const filters = ["All", "Korean", "Japanese", "Buffet", "Deals"];

const restaurants = [
  {
    name: "Seoul Garden BBQ",
    area: "District 1",
    type: "Korean BBQ",
    slot: "Earliest slot 18:30",
    rating: "4.8",
    note: "Instant confirmation available",
  },
  {
    name: "Hankki Hotpot House",
    area: "District 7",
    type: "Hotpot",
    slot: "Earliest slot 19:00",
    rating: "4.7",
    note: "Great for groups and family dinner",
  },
  {
    name: "Sora Izakaya",
    area: "Binh Thanh",
    type: "Japanese Dining",
    slot: "Earliest slot 20:00",
    rating: "4.6",
    note: "Late-night tables are filling quickly",
  },
];

export default function RestaurantsPage() {
  return (
    <MobileShell
      title="Restaurant List"
      subtitle="Browse, compare, and pick a table quickly."
      showBack
      bottomNav={<BottomNav activePath="/restaurants" />}
    >
      <TextInput
        radius="xl"
        size="md"
        placeholder="Search restaurant or area"
        leftSection={<IconSearch size={16} />}
        styles={{
          input: {
            border: "1px solid rgba(202, 181, 150, 0.24)",
            background: "#f7f0e6",
            height: 52,
          },
        }}
      />

      <Group grow>
        <Card radius="xl" p="sm" style={{ background: "#f7f1e7", boxShadow: "none" }}>
          <Group gap={8} wrap="nowrap">
            <ThemeIcon radius="xl" color="sand" variant="light">
              <IconClock size={16} />
            </ThemeIcon>
            <Box>
              <Text size="xs" c="dimmed">
                Date & time
              </Text>
              <Text fw={600}>Tue, Jul 21 · 19:00</Text>
            </Box>
          </Group>
        </Card>
        <Card radius="xl" p="sm" style={{ background: "#f7f1e7", boxShadow: "none" }}>
          <Group gap={8} wrap="nowrap">
            <ThemeIcon radius="xl" color="teal" variant="light">
              <IconUsers size={16} />
            </ThemeIcon>
            <Box>
              <Text size="xs" c="dimmed">
                Guests
              </Text>
              <Text fw={600}>2 people</Text>
            </Box>
          </Group>
        </Card>
      </Group>

      <Stack gap={10}>
        <Title order={4} size="h5" c="#20312c">
          Quick filters
        </Title>
        <Group gap="sm" wrap="nowrap" style={{ overflowX: "auto" }} className="hide-scrollbar">
          {filters.map((filter, index) => (
            <Chip
              key={filter}
              radius="xl"
              size="md"
              defaultChecked={index === 0}
              styles={{
                label: {
                  borderRadius: 999,
                  background: "#f6efe6",
                  border: "1px solid rgba(205, 183, 151, 0.2)",
                  minHeight: 42,
                  color: "#23312c",
                },
                iconWrapper: { display: "none" },
              }}
            >
              {filter}
            </Chip>
          ))}
        </Group>
      </Stack>

      {restaurants.map((restaurant) => (
        <Card
          key={restaurant.name}
          radius="xl"
          p="md"
          style={{
            border: "1px solid rgba(207, 183, 145, 0.24)",
            background: "rgba(255,251,247,0.88)",
            boxShadow: "0 12px 28px rgba(100, 71, 34, 0.06)",
          }}
        >
          <Stack gap="sm">
            <Box
              h={148}
              style={{
                borderRadius: 20,
                background:
                  "linear-gradient(135deg, rgba(15,95,86,0.94) 0%, rgba(209,145,74,0.85) 100%)",
              }}
            />

            <Group justify="space-between" align="flex-start">
              <Stack gap={2}>
                <Text fw={700} size="lg">
                  {restaurant.name}
                </Text>
                <Text size="sm" c="#6d736d">
                  {restaurant.type}
                </Text>
              </Stack>
              <Badge color="sand" variant="light">
                Popular
              </Badge>
            </Group>

            <Group gap="xs">
              <Badge
                leftSection={<IconStarFilled size={12} />}
                color="sand"
                radius="xl"
                variant="light"
              >
                {restaurant.rating}
              </Badge>
              <Badge radius="xl" variant="light" color="teal">
                {restaurant.slot}
              </Badge>
            </Group>

            <Group gap={6}>
              <IconMapPin size={14} color="#8a8f89" />
              <Text size="sm" c="#68716c">
                {restaurant.area}
              </Text>
            </Group>

            <Text size="sm" c="#30423d">
              {restaurant.note}
            </Text>
          </Stack>
        </Card>
      ))}
    </MobileShell>
  );
}
