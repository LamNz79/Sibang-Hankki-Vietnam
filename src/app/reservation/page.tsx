"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import { DatePicker } from "@mantine/dates";
import { Box, Button, Card, Group, Modal, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconCalendarEvent, IconCheck, IconClock, IconUsers } from "@tabler/icons-react";
import { MobileShell } from "@/components/app-shell/mobile-shell";
import { getRestaurantBySlug, restaurantRecords } from "@/features/restaurants/mock-data";
import { CustomerReservation, saveReservation } from "@/features/reservations/reservation-storage";
import { uiColors } from "@/components/ui/theme-tokens";

const guestOptions = [2, 4, 6] as const;
const bookingStartDate = dayjs().startOf("day");
const bookingEndDate = bookingStartDate.add(60, "day");

function getFirstAvailableDate(slotMatrix: Record<string, Record<string, string[]>>) {
  return Object.entries(slotMatrix)
    .filter(([date]) => date >= bookingStartDate.format("YYYY-MM-DD"))
    .sort(([a], [b]) => a.localeCompare(b))
    .find(([, guests]) => Object.values(guests).some((slots) => slots.length > 0))?.[0] ?? bookingStartDate.format("YYYY-MM-DD");
}

function ReservationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("restaurant") ?? "royal-pavilion";
  const restaurant = getRestaurantBySlug(slug) ?? restaurantRecords[0];
  const defaultDate = useMemo(() => getFirstAvailableDate(restaurant.slotMatrix), [restaurant.slotMatrix]);

  const [selectedDate, setSelectedDate] = useState<string | null>(defaultDate);
  const [selectedGuests, setSelectedGuests] = useState<number>(2);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<CustomerReservation | null>(null);
  const [successOpened, setSuccessOpened] = useState(false);

  const selectedDateIso = selectedDate ?? bookingStartDate.format("YYYY-MM-DD");
  const selectedDateLabel = selectedDate ? dayjs(selectedDate).format("ddd, MMM D, YYYY") : "No date selected";

  const availableTimes = useMemo(() => {
    const matrix = restaurant.slotMatrix[selectedDateIso];
    return matrix?.[String(selectedGuests)] ?? [];
  }, [restaurant, selectedDateIso, selectedGuests]);

  const confirmReservation = () => {
    if (!selectedDate || !selectedTime) return;

    const reservation: CustomerReservation = {
      id: `${Date.now()}-${restaurant.slug}`,
      restaurantSlug: restaurant.slug,
      restaurantName: restaurant.name,
      district: restaurant.district,
      cuisineLabel: restaurant.cuisineLabel,
      date: selectedDate,
      time: selectedTime,
      guests: selectedGuests,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    saveReservation(reservation);
    setConfirmedReservation(reservation);
    setSuccessOpened(true);
  };

  return (
    <MobileShell
      title="Book a table"
      subtitle="Table booking"
      backHref={`/restaurants/${restaurant.slug}`}
      bottomNav={null}
      footerContent={
        <Button
          fullWidth
          radius="md"
          size="lg"
          color="oligoTeal"
          disabled={!selectedTime}
          onClick={confirmReservation}
        >
          {selectedTime ? `Confirm ${selectedTime}` : "Select an available time"}
        </Button>
      }
    >
      <Card radius="lg" p="md" style={{ border: `1px solid ${uiColors.border}`, background: uiColors.surface }}>
        <Group wrap="nowrap">
          <Box w={60} h={60} style={{ borderRadius: 12, background: `repeating-linear-gradient(135deg, ${restaurant.heroAccent} 0 8px, #ffffff 8px 16px)` }} />
          <Stack gap={2}>
            <Text fw={700} c={uiColors.textPrimary}>{restaurant.name}</Text>
            <Text size="sm" c={uiColors.textSecondary}>{restaurant.district} · {restaurant.cuisineLabel}</Text>
          </Stack>
        </Group>
      </Card>

      <Stack gap="sm">
        <Text fw={700} size="lg">Date</Text>
        <Card radius="lg" p="sm" style={{ border: `1px solid ${uiColors.border}`, background: uiColors.surface }}>
          <Stack gap="sm">
            <DatePicker
              fullWidth
              value={selectedDate}
              onChange={(value) => {
                if (!value) return;
                const next = dayjs(value);
                if (next.isBefore(bookingStartDate, "day") || next.isAfter(bookingEndDate, "day")) return;
                setSelectedDate(value);
                setSelectedTime(null);
              }}
              minDate={bookingStartDate.format("YYYY-MM-DD")}
              maxDate={bookingEndDate.format("YYYY-MM-DD")}
              maxLevel="month"
              getDayProps={(date) => {
                const current = dayjs(date);
                const isPast = current.isBefore(bookingStartDate, "day");

                return {
                  disabled: isPast,
                };
              }}
              styles={{
                datePickerRoot: { width: "100%" },
                month: { width: "100%" },
                monthCell: { width: "14.2857%" },
                calendarHeader: { maxWidth: "100%" },
                calendarHeaderLevel: {
                  flex: 1,
                  textAlign: "center",
                  fontWeight: 700,
                  color: uiColors.textPrimary,
                },
                calendarHeaderControl: {
                  border: `1px solid ${uiColors.border}`,
                  color: uiColors.textSecondary,
                },
                day: {
                  borderRadius: 999,
                  width: "100%",
                  fontWeight: 500,
                },
                weekday: {
                  color: uiColors.textSecondary,
                  fontWeight: 600,
                },
              }}
            />

            <Card radius="lg" p="sm" style={{ background: uiColors.surfaceAlt, border: `1px solid ${uiColors.border}` }}>
              <Text size="xs" c={uiColors.textSecondary}>Selected date</Text>
              <Text fw={700} c={uiColors.textPrimary}>{selectedDateLabel}</Text>
            </Card>
          </Stack>
        </Card>
      </Stack>

      <Stack gap="sm">
        <Text fw={700} size="lg">Guests</Text>
        <SimpleGrid cols={3} spacing="sm">
          {guestOptions.map((count) => {
            const active = selectedGuests === count;
            return (
              <Card
                key={count}
                p="md"
                radius="md"
                onClick={() => {
                  setSelectedGuests(count);
                  setSelectedTime(null);
                }}
                style={{ cursor: "pointer", border: active ? `1px solid ${uiColors.brandPrimary}` : `1px solid ${uiColors.border}`, background: active ? uiColors.brandPrimarySoft : uiColors.surface }}
              >
                <Text ta="center" fw={active ? 700 : 500} c={active ? uiColors.brandPrimary : uiColors.textPrimary}>{count}</Text>
              </Card>
            );
          })}
        </SimpleGrid>
      </Stack>

      <Stack gap="sm">
        <Text fw={700} size="lg">Time</Text>
        {availableTimes.length > 0 ? (
          <SimpleGrid cols={3} spacing="sm">
            {availableTimes.map((time) => {
              const active = selectedTime === time;
              return (
                <Card key={time} p="md" radius="md" onClick={() => setSelectedTime(time)} style={{ cursor: "pointer", border: active ? `1px solid ${uiColors.brandPrimary}` : `1px solid ${uiColors.border}`, background: active ? uiColors.brandPrimarySoft : uiColors.surface }}>
                  <Text ta="center" fw={active ? 700 : 500} c={active ? uiColors.brandPrimary : uiColors.textPrimary}>{time}</Text>
                </Card>
              );
            })}
          </SimpleGrid>
        ) : (
          <Card radius="lg" p="md" style={{ border: `1px solid ${uiColors.border}`, background: uiColors.surfaceAlt }}>
            <Stack gap={4}>
              <Text fw={700} c={uiColors.textPrimary}>No slots for this date yet</Text>
              <Text size="sm" c={uiColors.textSecondary}>Try another date or guest count. We only show available times once the restaurant opens slots.</Text>
            </Stack>
          </Card>
        )}
      </Stack>

      <Modal
        opened={successOpened}
        onClose={() => setSuccessOpened(false)}
        centered
        title={null}
        radius="xl"
        padding="xl"
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        styles={{
          inner: { padding: 16 },
          content: { width: "100%", maxWidth: 528 },
          body: { paddingTop: 8 },
        }}
      >
        {confirmedReservation ? (
          <Stack gap="lg" align="center">
            <ThemeIcon size={68} radius={999} color="oligoTeal" variant="light">
              <IconCheck size={34} stroke={2.5} />
            </ThemeIcon>

            <Stack gap={4} align="center">
              <Text fw={800} size="xl" ta="center" c={uiColors.textPrimary}>
                Reservation confirmed
              </Text>
              <Text size="sm" ta="center" c={uiColors.textSecondary}>
                Your table at {confirmedReservation.restaurantName} is ready in your reservations.
              </Text>
            </Stack>

            <Card w="100%" radius="lg" p="md" style={{ border: `1px solid ${uiColors.border}`, background: uiColors.surfaceAlt }}>
              <Stack gap="sm">
                <Text fw={700} c={uiColors.textPrimary}>{confirmedReservation.restaurantName}</Text>
                <Group gap="xs" wrap="nowrap">
                  <IconCalendarEvent size={17} color={uiColors.brandPrimary} />
                  <Text size="sm">{dayjs(confirmedReservation.date).format("ddd, MMM D, YYYY")}</Text>
                </Group>
                <Group gap="xs" wrap="nowrap">
                  <IconClock size={17} color={uiColors.brandPrimary} />
                  <Text size="sm">{confirmedReservation.time}</Text>
                </Group>
                <Group gap="xs" wrap="nowrap">
                  <IconUsers size={17} color={uiColors.brandPrimary} />
                  <Text size="sm">{confirmedReservation.guests} guests · {confirmedReservation.district}</Text>
                </Group>
              </Stack>
            </Card>

            <Stack w="100%" gap="sm">
              <Button fullWidth size="lg" radius="md" color="oligoTeal" onClick={() => router.push("/reservations")}>
                View my reservation
              </Button>
              <Button fullWidth size="lg" radius="md" variant="subtle" color="gray" onClick={() => router.push("/restaurants")}>
                Explore more restaurants
              </Button>
            </Stack>
          </Stack>
        ) : null}
      </Modal>
    </MobileShell>
  );
}

export default function ReservationPage() {
  return (
    <Suspense fallback={<MobileShell title="Book a table" subtitle="Loading booking details..." bottomNav={null}><Text>Loading...</Text></MobileShell>}>
      <ReservationContent />
    </Suspense>
  );
}
