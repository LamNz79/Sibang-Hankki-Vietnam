"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { Box, Button, Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconCalendarCheck, IconCalendarEvent, IconChevronRight, IconClock, IconUsers } from "@tabler/icons-react";
import { BottomNav, MobileShell } from "@/components/layout/customer";
import { StatusBadge } from "@/components/ui";
import {
  getReservationDisplaySlot,
  getReservationStatusFlags,
} from "@/features/reservations/domain/selectors";
import { useCustomerReservations } from "@/features/reservations/hooks/use-customer-reservations";
import { uiColors } from "@/theme";

/** Lists customer reservations with status-aware dates, times, and actions. */
export function ReservationsScreen() {
  const reservations = useCustomerReservations();

  return (
    <MobileShell
      title="My reservations"
      subtitle="Your upcoming dining plans."
      bottomNav={<BottomNav activePath="/reservations" />}
    >
      <Stack gap={6} align="center" py="sm">
        <ThemeIcon size={52} radius={999} color="warmCoral" variant="light">
          <IconCalendarCheck size={26} />
        </ThemeIcon>
        <Text fw={800} size="lg" c={uiColors.textPrimary}>Upcoming reservations</Text>
        <Text size="sm" c={uiColors.textSecondary}>Track requests and confirmed dining plans.</Text>
      </Stack>

      {reservations.length > 0 ? (
        <Stack gap="md">
          {reservations.map((reservation) => {
            const { isPending, isAlternative, isDeclined } =
              getReservationStatusFlags(reservation);
            const displaySlot = getReservationDisplaySlot(reservation);

            return (
              <Card
                key={reservation.id}
                component={Link}
                href={`/reservations/${reservation.id}`}
                radius="lg"
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
                    <StatusBadge
                      tone={
                        isPending
                          ? "warning"
                          : isAlternative
                            ? "brand"
                            : isDeclined
                              ? "error"
                              : "success"
                      }
                      w="fit-content"
                    >
                      {isPending
                        ? "Pending confirmation"
                        : isAlternative
                          ? "Action required"
                          : isDeclined
                            ? "Request declined"
                            : "Confirmed"}
                    </StatusBadge>
                    <Text fw={750} c={uiColors.textPrimary}>{reservation.restaurantName}</Text>
                    <Group gap={6} wrap="nowrap">
                      <IconCalendarEvent size={15} color={uiColors.textSecondary} />
                      <Text size="xs" c={uiColors.textSecondary}>{dayjs(displaySlot.date).format("ddd, MMM D")}</Text>
                      <IconClock size={15} color={uiColors.textSecondary} />
                      <Text
                        size="xs"
                        fw={isAlternative ? 750 : 400}
                        c={
                          isAlternative
                            ? uiColors.brandPrimary
                            : uiColors.textSecondary
                        }
                      >
                        {displaySlot.isSuggested
                          ? `Suggested ${displaySlot.time}`
                          : displaySlot.time}
                      </Text>
                    </Group>
                    <Group gap={6} wrap="nowrap">
                      <IconUsers size={15} color={uiColors.textSecondary} />
                      <Text size="xs" c={uiColors.textSecondary}>{reservation.guests} guests · {reservation.district}</Text>
                    </Group>
                  </Stack>

                  <IconChevronRight size={18} color={uiColors.textMuted} />
                </Group>
              </Card>
            );
          })}
        </Stack>
      ) : (
        <Card radius="lg" p="xl" style={{ border: `1px dashed ${uiColors.borderStrong}`, background: uiColors.surfaceAlt }}>
          <Stack align="center" gap="sm">
            <Text fw={700} c={uiColors.textPrimary}>No upcoming reservations</Text>
            <Text size="sm" ta="center" c={uiColors.textSecondary}>Your reservation requests and confirmed bookings will appear here.</Text>
            <Button
              component={Link}
              href="/restaurants"
              color="warmCoral"
              radius="md"
              size="md"
              fullWidth
              style={{ background: uiColors.brandPrimary, color: uiColors.surface }}
            >
              Explore restaurants
            </Button>
          </Stack>
        </Card>
      )}

      <Stack gap="sm">
        <Text fw={700} size="lg" c={uiColors.textPrimary}>Past reservations</Text>
        <Card radius="md" p="lg" style={{ border: `1px dashed ${uiColors.borderStrong}`, background: uiColors.surface }}>
          <Text size="sm" ta="center" c={uiColors.textSecondary}>Completed visits and reviews will appear here.</Text>
        </Card>
      </Stack>
    </MobileShell>
  );
}
