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
        <Card
          key={`${booking.restaurant}-${booking.date}`}
          radius="xl"
          p="lg"
          style={{
            border: "1px solid rgba(207, 183, 145, 0.24)",
            background: "rgba(255,251,247,0.88)",
            boxShadow: "0 12px 28px rgba(100, 71, 34, 0.06)",
          }}
        >
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Text fw={700} size="lg">
                {booking.restaurant}
              </Text>
              <Text size="sm" c="#68716c">
                {booking.date} · {booking.time}
              </Text>
            </Stack>

            <Badge
              color={booking.status === "Confirmed" ? "teal" : "orange"}
              variant="light"
              radius="xl"
            >
              {booking.status}
            </Badge>
          </Group>
        </Card>
      ))}
    </MobileShell>
  );
}
