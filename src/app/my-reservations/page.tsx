import { Badge, Card, Group, Stack, Text } from "@mantine/core";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { MobileShell } from "@/components/app-shell/mobile-shell";

const bookings = [
  {
    restaurant: "Seoul Garden BBQ",
    date: "Sat, Jul 25",
    time: "19:00",
    status: "Confirmed",
  },
  {
    restaurant: "Sora Izakaya",
    date: "Tue, Jul 28",
    time: "20:00",
    status: "Pending",
  },
];

export default function MyReservationsPage() {
  return (
    <MobileShell
      title="My Reservations"
      subtitle="Review booking status and next actions."
      bottomNav={<BottomNav activePath="/my-reservations" />}
    >
      {bookings.map((booking) => (
        <Card key={`${booking.restaurant}-${booking.date}`} radius="xl" p="lg" withBorder>
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Text fw={700}>{booking.restaurant}</Text>
              <Text size="sm" c="dimmed">
                {booking.date} · {booking.time}
              </Text>
            </Stack>

            <Badge color={booking.status === "Confirmed" ? "teal" : "orange"} variant="light">
              {booking.status}
            </Badge>
          </Group>
        </Card>
      ))}
    </MobileShell>
  );
}
