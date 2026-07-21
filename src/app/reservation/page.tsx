import { Badge, Button, Card, Group, Stack, Text } from "@mantine/core";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { MobileShell } from "@/components/app-shell/mobile-shell";

const bookings = [
  {
    restaurant: "Seoul Garden BBQ",
    branch: "District 1",
    date: "Tue, Jul 21, 2026",
    time: "19:00",
    guests: "4 guests",
    status: "Confirmed",
  },
  {
    restaurant: "Sora Izakaya",
    branch: "Binh Thanh",
    date: "Fri, Jul 24, 2026",
    time: "20:00",
    guests: "2 guests",
    status: "Pending",
  },
  {
    restaurant: "Hankki Hotpot House",
    branch: "District 7",
    date: "Sun, Jul 26, 2026",
    time: "18:30",
    guests: "5 guests",
    status: "Completed",
  },
];

export default function ReservationPage() {
  return (
    <MobileShell
      title="My Reservations"
      subtitle="Review booked tables, status, and next actions."
      bottomNav={<BottomNav activePath="/reservation" />}
    >
      {bookings.map((booking) => (
        <Card
          key={`${booking.restaurant}-${booking.date}-${booking.time}`}
          radius="xl"
          p="lg"
          style={{
            border: "1px solid rgba(207, 183, 145, 0.24)",
            background: "rgba(255,251,247,0.88)",
            boxShadow: "0 12px 28px rgba(100, 71, 34, 0.06)",
          }}
        >
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Text fw={700} size="lg">
                  {booking.restaurant}
                </Text>
                <Text size="sm" c="#68716c">
                  {booking.branch}
                </Text>
              </Stack>

              <Badge
                color={
                  booking.status === "Confirmed"
                    ? "oligoTeal"
                    : booking.status === "Pending"
                      ? "orange"
                      : "gray"
                }
                variant="light"
                radius="xl"
              >
                {booking.status}
              </Badge>
            </Group>

            <Group justify="space-between" align="center">
              <Stack gap={2}>
                <Text size="sm" c="#7d7366">
                  Date & time
                </Text>
                <Text fw={600} c="#21312c">
                  {booking.date} · {booking.time}
                </Text>
              </Stack>

              <Stack gap={2} align="flex-end">
                <Text size="sm" c="#7d7366">
                  Party
                </Text>
                <Text fw={600} c="#21312c">
                  {booking.guests}
                </Text>
              </Stack>
            </Group>

            <Group grow>
              <Button radius="xl" variant="light" color="oligoTeal">
                View details
              </Button>
              <Button radius="xl" color="oligoTeal">
                Contact branch
              </Button>
            </Group>
          </Stack>
        </Card>
      ))}
    </MobileShell>
  );
}
