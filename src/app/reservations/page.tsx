"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import dayjs from "dayjs";
import { Badge, Box, Button, Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconCalendarCheck, IconCalendarEvent, IconChevronRight, IconClock, IconUsers } from "@tabler/icons-react";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { MobileShell } from "@/components/app-shell/mobile-shell";
import {
  getReservationsServerSnapshot,
  getReservationsSnapshot,
  subscribeToReservations,
} from "@/features/reservations/reservation-storage";
import { uiColors } from "@/components/ui/theme-tokens";

export default function ReservationsPage() {
  const reservations = useSyncExternalStore(
    subscribeToReservations,
    getReservationsSnapshot,
    getReservationsServerSnapshot,
  );

  return (
    <MobileShell
      title="My reservations"
      subtitle="Your upcoming dining plans."
      bottomNav={<BottomNav activePath="/reservations" />}
    >
      <Stack gap={6} align="center" py="sm">
        <ThemeIcon size={52} radius={999} color="oligoTeal" variant="light">
          <IconCalendarCheck size={26} />
        </ThemeIcon>
        <Text fw={800} size="lg" c={uiColors.textPrimary}>Upcoming reservations</Text>
        <Text size="sm" c={uiColors.textSecondary}>Review your confirmed dining plans.</Text>
      </Stack>

      {reservations.length > 0 ? (
        <Stack gap="md">
          {reservations.map((reservation) => (
            <Card
              key={reservation.id}
              component={Link}
              href={`/restaurants/${reservation.restaurantSlug}`}
              radius="xl"
              p="md"
              style={{
                color: "inherit",
                textDecoration: "none",
                border: `1px solid ${uiColors.border}`,
                background: uiColors.surface,
              }}
            >
              <Group wrap="nowrap" align="center">
                <Box
                  w={64}
                  h={64}
                  style={{
                    flexShrink: 0,
                    borderRadius: 12,
                    background: `repeating-linear-gradient(135deg, ${uiColors.brandPrimarySoft} 0 8px, #ffffff 8px 16px)`,
                  }}
                />

                <Stack gap={5} style={{ flex: 1 }}>
                  <Badge color="oligoTeal" variant="light" radius="sm" w="fit-content">
                    Confirmed
                  </Badge>
                  <Text fw={750} c={uiColors.textPrimary}>{reservation.restaurantName}</Text>
                  <Group gap={6} wrap="nowrap">
                    <IconCalendarEvent size={15} color={uiColors.textSecondary} />
                    <Text size="xs" c={uiColors.textSecondary}>{dayjs(reservation.date).format("ddd, MMM D")}</Text>
                    <IconClock size={15} color={uiColors.textSecondary} />
                    <Text size="xs" c={uiColors.textSecondary}>{reservation.time}</Text>
                  </Group>
                  <Group gap={6} wrap="nowrap">
                    <IconUsers size={15} color={uiColors.textSecondary} />
                    <Text size="xs" c={uiColors.textSecondary}>{reservation.guests} guests · {reservation.district}</Text>
                  </Group>
                </Stack>

                <IconChevronRight size={18} color={uiColors.textMuted} />
              </Group>
            </Card>
          ))}
        </Stack>
      ) : (
        <Card radius="xl" p="xl" style={{ border: `1px dashed ${uiColors.borderStrong}`, background: uiColors.surfaceAlt }}>
          <Stack align="center" gap="sm">
            <Text fw={700} c={uiColors.textPrimary}>No upcoming reservations</Text>
            <Text size="sm" ta="center" c={uiColors.textSecondary}>Your confirmed restaurant bookings will appear here.</Text>
            <Button component={Link} href="/restaurants" color="oligoTeal" radius="md">
              Explore restaurants
            </Button>
          </Stack>
        </Card>
      )}

      <Stack gap="sm">
        <Text fw={700} size="lg" c={uiColors.textPrimary}>Past reservations</Text>
        <Card radius="lg" p="lg" style={{ border: `1px dashed ${uiColors.borderStrong}`, background: uiColors.surface }}>
          <Text size="sm" ta="center" c={uiColors.textSecondary}>Completed visits and reviews will appear here.</Text>
        </Card>
      </Stack>
    </MobileShell>
  );
}
