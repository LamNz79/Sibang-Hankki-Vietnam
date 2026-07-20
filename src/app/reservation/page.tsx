import { Badge, Button, Card, Group, SegmentedControl, Stack, Text, TextInput } from "@mantine/core";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { MobileShell } from "@/components/app-shell/mobile-shell";

export default function ReservationPage() {
  return (
    <MobileShell
      title="Reservation"
      subtitle="Draft mobile booking form for MVP discussion."
      showBack
      bottomNav={<BottomNav activePath="/reservation" />}
    >
      <Card radius="xl" p="lg" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={700}>Seoul Garden BBQ</Text>
            <Badge color="teal" variant="light">
              District 1
            </Badge>
          </Group>

          <TextInput label="Date" placeholder="2026-07-25" radius="md" />
          <TextInput label="Time" placeholder="19:00" radius="md" />
          <TextInput label="Party size" placeholder="4 guests" radius="md" />
          <TextInput label="Name" placeholder="Your name" radius="md" />
          <TextInput label="Phone" placeholder="+84 ..." radius="md" />
          <SegmentedControl
            fullWidth
            radius="xl"
            data={[
              { label: "Instant", value: "instant" },
              { label: "Approval", value: "approval" },
            ]}
          />

          <Button radius="xl" size="md">
            Create reservation
          </Button>
        </Stack>
      </Card>
    </MobileShell>
  );
}
