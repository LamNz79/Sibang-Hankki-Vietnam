import Link from "next/link";
import {
  Box,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconChevronRight,
  IconRosetteDiscountCheck,
  IconToolsKitchen3,
  IconUsers,
} from "@tabler/icons-react";
import { OwnerShell } from "@/components/owner/owner-shell";
import { OwnerReservationRow } from "@/components/owner/owner-reservation-row";
import { ownerReservations } from "@/features/owner/mock-data";
import { uiColors } from "@/components/ui/theme-tokens";

const metrics = [
  {
    value: "12",
    label: "Today's bookings",
    icon: IconCalendarEvent,
  },
  { value: "38", label: "Expected guests", icon: IconUsers },
  { value: "8", label: "Pre-orders", icon: IconToolsKitchen3 },
  { value: "3", label: "VIP guests", icon: IconRosetteDiscountCheck },
];

export default function OwnerTodayPage() {
  const nextArrival = ownerReservations[1];

  return (
    <OwnerShell
      title="The Royal Pavilion"
      eyebrow="Restaurant workspace"
    >
      <Stack gap="lg">
        <Link
          href={`/owner/check-in?reservation=${nextArrival.id}`}
          style={{ color: "inherit", textDecoration: "none" }}
        >
          <Card
            radius="lg"
            p="lg"
            style={{
              background: uiColors.brandPrimarySoft,
              border: `1px solid #b9dcd7`,
            }}
          >
            <Group wrap="nowrap">
              <ThemeIcon
                size={46}
                radius="xl"
                variant="light"
                color="oligoTeal"
              >
                <IconCalendarEvent size={22} />
              </ThemeIcon>
              <Stack gap={1} style={{ flex: 1 }}>
                <Text size="xs" c={uiColors.textSecondary}>
                  Next arrival
                </Text>
                <Text fw={800} c={uiColors.textPrimary}>
                  {nextArrival.time} · {nextArrival.guestName}
                </Text>
                <Text size="xs" c={uiColors.textSecondary}>
                  VIP · {nextArrival.partySize} guests · pre-order
                </Text>
              </Stack>
              <IconChevronRight size={18} color={uiColors.brandPrimary} />
            </Group>
          </Card>
        </Link>

        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <Card
                key={metric.label}
                radius="lg"
                p="md"
                style={{
                  background: uiColors.surface,
                  border: `1px solid ${uiColors.border}`,
                  boxShadow: "none",
                }}
              >
                <Stack gap={6}>
                  <Icon size={20} color={uiColors.brandPrimary} />
                  <Title order={2} size="h3" c={uiColors.textPrimary}>
                    {metric.value}
                  </Title>
                  <Text size="xs" c={uiColors.textSecondary}>
                    {metric.label}
                  </Text>
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>

        <Card
          radius="lg"
          p={{ base: "md", md: "lg" }}
          style={{
            background: uiColors.surface,
            border: `1px solid ${uiColors.border}`,
            boxShadow: "none",
          }}
        >
          <Group justify="space-between" mb="xs">
            <Title order={2} size="h4" c={uiColors.textPrimary}>
              Today&apos;s reservations
            </Title>
            <Link
              href="/owner/reservations"
              style={{
                color: uiColors.brandPrimary,
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              View all
            </Link>
          </Group>

          <Box>
            {ownerReservations.slice(0, 3).map((reservation) => (
              <OwnerReservationRow
                key={reservation.id}
                reservation={reservation}
                compact
              />
            ))}
          </Box>
        </Card>
      </Stack>
    </OwnerShell>
  );
}
