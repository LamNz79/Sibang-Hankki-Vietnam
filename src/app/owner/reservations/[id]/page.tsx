"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconCheck,
  IconCircleCheck,
  IconMessage,
  IconSofa,
  IconUserCheck,
} from "@tabler/icons-react";
import { OwnerShell } from "@/components/owner/owner-shell";
import {
  GuestContextBadges,
  ReservationStatusBadge,
} from "@/components/owner/owner-badges";
import {
  getOwnerReservation,
  type OwnerReservationStatus,
} from "@/features/owner/mock-data";
import { uiColors } from "@/components/ui/theme-tokens";

function visitActionStyle(active = false) {
  return {
    height: 54,
    border: `1px solid ${
      active ? uiColors.brandPrimary : uiColors.borderStrong
    }`,
    background: active ? uiColors.brandPrimarySoft : uiColors.surface,
    color: active ? uiColors.brandPrimary : uiColors.textPrimary,
    boxShadow: "none",
  };
}

export default function OwnerGuestArrivalPage() {
  const params = useParams<{ id: string }>();
  const reservation = getOwnerReservation(params.id);
  const [status, setStatus] = useState<OwnerReservationStatus>(
    reservation?.status ?? "confirmed",
  );

  if (!reservation) {
    return (
      <OwnerShell
        title="Guest arrival"
        backHref="/owner/reservations"
      >
        <Card p="xl">
          <Text fw={700}>Reservation not found.</Text>
        </Card>
      </OwnerShell>
    );
  }

  return (
    <OwnerShell
      title="Guest arrival"
      eyebrow="Guest context"
      backHref="/owner/reservations"
    >
      <Stack gap="md">
        <Card
          radius="lg"
          p={{ base: "md", md: "lg" }}
          style={{
            background: uiColors.surface,
            border: `1px solid ${uiColors.border}`,
          }}
        >
          <Group wrap="nowrap">
            <Avatar
              size={64}
              radius="xl"
              styles={{
                root: {
                  background: uiColors.brandOrangeSoft,
                  color: uiColors.brandOrange,
                  fontWeight: 800,
                },
              }}
            >
              {reservation.initials}
            </Avatar>
            <Stack gap={5} style={{ flex: 1 }}>
              <GuestContextBadges
                tier={reservation.tier}
                preOrder={reservation.preOrder}
              />
              <Title order={2} size="h3">
                {reservation.guestName}
              </Title>
              <Text size="sm" c={uiColors.textSecondary}>
                {reservation.time} · {reservation.partySize} guests
              </Text>
            </Stack>
            <ReservationStatusBadge status={status} />
          </Group>
        </Card>

        <Card
          radius="lg"
          p="md"
          style={{
            background: "#fffaf2",
            border: "1px solid #ead1a8",
          }}
        >
          <Group gap="sm" align="flex-start" wrap="nowrap">
            <IconMessage
              size={18}
              color="#8b5a14"
              style={{ marginTop: 2 }}
            />
            <Stack gap={4}>
              <Text fw={750} size="sm" c="#6f4810">
                Service notes
              </Text>
              <Text size="sm" c="#6f4810">
                Prefers window seating · Korean sharing set pre-ordered ·
                birthday dessert request
              </Text>
            </Stack>
          </Group>
        </Card>

        <Stack gap="sm">
          <Text fw={800}>Visit status</Text>
          <SimpleGrid cols={2} spacing="sm">
            <Button
              variant="default"
              radius="md"
              leftSection={<IconCheck size={17} />}
              onClick={() => setStatus("confirmed")}
              style={visitActionStyle(status === "confirmed")}
              styles={{ label: { fontWeight: 750 } }}
            >
              Confirmed
            </Button>
            <Button
              variant="default"
              radius="md"
              leftSection={<IconUserCheck size={17} />}
              onClick={() => setStatus("arrived")}
              style={visitActionStyle(status === "arrived")}
              styles={{ label: { fontWeight: 750 } }}
            >
              Arrived
            </Button>
            <Button
              variant="default"
              radius="md"
              leftSection={<IconSofa size={17} />}
              onClick={() => setStatus("seated")}
              style={visitActionStyle(status === "seated")}
              styles={{ label: { fontWeight: 750 } }}
            >
              Seated
            </Button>
            <Button
              variant="default"
              radius="md"
              leftSection={<IconCircleCheck size={17} />}
              onClick={() => setStatus("completed")}
              style={visitActionStyle(status === "completed")}
              styles={{ label: { fontWeight: 750 } }}
            >
              Completed
            </Button>
          </SimpleGrid>
        </Stack>

        <Stack gap="sm">
          <Text fw={800}>Guest history</Text>
          <SimpleGrid cols={3} spacing={0}>
            {[
              ["Last visit", reservation.lastVisit ?? "—"],
              ["Visits", String(reservation.visits)],
              ["Points", String(reservation.points)],
            ].map(([label, value]) => (
              <Card
                key={label}
                radius={0}
                p="md"
                style={{
                  background: uiColors.surface,
                  border: `1px solid ${uiColors.border}`,
                }}
              >
                <Stack gap={3} align="center">
                  <Text size="xs" c={uiColors.textSecondary}>
                    {label}
                  </Text>
                  <Text fw={800}>{value}</Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Stack>
    </OwnerShell>
  );
}
