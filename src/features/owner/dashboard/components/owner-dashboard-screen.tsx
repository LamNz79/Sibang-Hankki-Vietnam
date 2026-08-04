"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Group,
  Modal,
  NumberInput,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconRosetteDiscountCheck,
  IconToolsKitchen3,
  IconUsers,
} from "@tabler/icons-react";
import {
  MetricCard,
  PrimaryActionButton,
  SelectionChip,
} from "@/components/ui";
import { ownerReservations } from "@/features/owner/data/mock-data";
import { OwnerReservationRow } from "@/features/owner/reservations";
import { OwnerShell } from "@/features/owner/shared";
import type {
  OwnerReservation,
  OwnerReservationStatus,
} from "@/features/owner/types";
import { uiColors } from "@/theme";

type ReservationFilter = "all" | OwnerReservationStatus;

const statusFilters: Array<{
  value: ReservationFilter;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "arrived", label: "Arrived" },
  { value: "seated", label: "Seated" },
  { value: "completed", label: "Completed" },
];

function getStatusCount(
  reservations: OwnerReservation[],
  filter: ReservationFilter,
) {
  if (filter === "all") return reservations.length;
  return reservations.filter((reservation) => reservation.status === filter)
    .length;
}

export function OwnerDashboardScreen() {
  const [selectedDate, setSelectedDate] = useState(dayjs().startOf("day"));
  const [filter, setFilter] = useState<ReservationFilter>("all");
  const [walkInOpened, setWalkInOpened] = useState(false);

  const filteredReservations = useMemo(() => {
    if (filter === "all") return ownerReservations;
    return ownerReservations.filter(
      (reservation) => reservation.status === filter,
    );
  }, [filter]);

  const pendingReservations = ownerReservations.filter(
    (reservation) => reservation.status === "pending",
  );
  const nextArrival = ownerReservations.find(
    (reservation) => reservation.status === "confirmed",
  );
  const expectedGuests = ownerReservations.reduce(
    (total, reservation) => total + reservation.partySize,
    0,
  );
  const preOrderCount = ownerReservations.filter(
    (reservation) => reservation.preOrder,
  ).length;
  const vipCount = ownerReservations.filter(
    (reservation) => reservation.tier === "vip",
  ).length;
  const isToday = selectedDate.isSame(dayjs(), "day");
  const dateLabel = isToday
    ? `Today · ${selectedDate.format("dddd, MMM D")}`
    : selectedDate.format("dddd, MMM D");

  const metrics = [
    {
      value: String(ownerReservations.length),
      label: "Bookings",
      icon: IconCalendarEvent,
    },
    {
      value: String(expectedGuests),
      label: "Expected guests",
      icon: IconUsers,
    },
    {
      value: String(preOrderCount),
      label: "Pre-orders",
      icon: IconToolsKitchen3,
    },
    {
      value: String(vipCount),
      label: "VIP guests",
      icon: IconRosetteDiscountCheck,
    },
  ];

  const openWalkIn = () => setWalkInOpened(true);

  return (
    <>
      <OwnerShell
        title="The Royal Pavilion"
        eyebrow="Today · Service overview"
        footerAction={
          <PrimaryActionButton
            leftSection={<IconPlus size={20} />}
            onClick={openWalkIn}
          >
            Add walk-in
          </PrimaryActionButton>
        }
      >
        <Stack gap="lg">
          <Box
            style={{
              position: "sticky",
              top: -16,
              zIndex: 10,
              marginInline: -4,
              padding: "0 4px 10px",
              background: uiColors.appBackground,
            }}
          >
            <Stack gap="sm">
              <Card
                radius="lg"
                p="sm"
                style={{
                  background: uiColors.surface,
                  border: `1px solid ${uiColors.border}`,
                }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <ActionIcon
                    variant="light"
                    color="gray"
                    radius="md"
                    aria-label="Previous day"
                    onClick={() =>
                      setSelectedDate((current) => current.subtract(1, "day"))
                    }
                  >
                    <IconChevronLeft size={18} />
                  </ActionIcon>
                  <Stack gap={0} align="center">
                    <Text fw={800} c={uiColors.textPrimary}>
                      {dateLabel}
                    </Text>
                    {!isToday ? (
                      <Button
                        variant="subtle"
                        color="warmCoral"
                        size="compact-xs"
                        onClick={() => setSelectedDate(dayjs().startOf("day"))}
                      >
                        Return to today
                      </Button>
                    ) : null}
                  </Stack>
                  <ActionIcon
                    variant="light"
                    color="gray"
                    radius="md"
                    aria-label="Next day"
                    onClick={() =>
                      setSelectedDate((current) => current.add(1, "day"))
                    }
                  >
                    <IconChevronRight size={18} />
                  </ActionIcon>
                </Group>
              </Card>

              <ScrollArea type="never" offsetScrollbars={false}>
                <Group gap="xs" wrap="nowrap">
                  {statusFilters.map((option) => {
                    const count = getStatusCount(
                      ownerReservations,
                      option.value,
                    );

                    return (
                      <SelectionChip
                        key={option.value}
                        checked={filter === option.value}
                        compact
                        onChange={() => setFilter(option.value)}
                      >
                        {option.label} {count}
                      </SelectionChip>
                    );
                  })}
                </Group>
              </ScrollArea>
            </Stack>
          </Box>

          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </SimpleGrid>

          {pendingReservations.length > 0 ? (
            <Card
              radius="lg"
              p="md"
              style={{
                background: uiColors.statusWarningSurface,
                border: `1px solid ${uiColors.statusWarningBorder}`,
              }}
            >
              <Group gap="sm" wrap="nowrap" align="flex-start">
                <ThemeIcon
                  size={40}
                  radius="xl"
                  variant="light"
                  color="sand"
                >
                  <IconAlertCircle size={20} />
                </ThemeIcon>
                <Stack gap={3} style={{ flex: 1 }}>
                  <Text fw={800} c={uiColors.statusWarningTextStrong}>
                    Needs attention
                  </Text>
                  <Text size="sm" c={uiColors.statusWarningTextStrong}>
                    {pendingReservations.length} reservation request
                    {pendingReservations.length === 1 ? " is" : "s are"} waiting
                    for confirmation.
                  </Text>
                </Stack>
                <Link
                  href={`/owner/reservations/${pendingReservations[0].id}`}
                  style={{
                    color: uiColors.statusWarningTextStrong,
                    textDecoration: "none",
                  }}
                >
                  <IconChevronRight size={19} />
                </Link>
              </Group>
            </Card>
          ) : null}

          {nextArrival ? (
            <Link
              href={`/owner/check-in?reservation=${nextArrival.id}`}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <Card
                radius="lg"
                p="lg"
                style={{
                  background: uiColors.brandPrimarySoft,
                  border: `1px solid ${uiColors.borderStrong}`,
                }}
              >
                <Group wrap="nowrap">
                  <ThemeIcon
                    size={46}
                    radius="xl"
                    variant="light"
                    color="warmCoral"
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
                      {nextArrival.tier === "vip" ? "VIP · " : ""}
                      {nextArrival.partySize} guests
                      {nextArrival.preOrder ? " · pre-order" : ""}
                    </Text>
                  </Stack>
                  <IconChevronRight size={18} color={uiColors.brandPrimary} />
                </Group>
              </Card>
            </Link>
          ) : null}

          <Card
            radius="lg"
            px={{ base: "md", md: "lg" }}
            py={0}
            style={{
              background: uiColors.surface,
              border: `1px solid ${uiColors.border}`,
              boxShadow: "none",
            }}
          >
            <Group justify="space-between" pt="md" pb="xs">
              <Title order={2} size="h4" c={uiColors.textPrimary}>
                Reservations
              </Title>
              <Text size="xs" c={uiColors.textSecondary}>
                {filteredReservations.length} shown
              </Text>
            </Group>

            {filteredReservations.length > 0 ? (
              <Box>
                {filteredReservations.map((reservation) => (
                  <OwnerReservationRow
                    key={reservation.id}
                    reservation={reservation}
                  />
                ))}
              </Box>
            ) : (
              <Stack align="center" gap={4} py="xl">
                <Text fw={700} c={uiColors.textPrimary}>
                  No {filter} reservations
                </Text>
                <Text size="sm" ta="center" c={uiColors.textSecondary}>
                  Choose another status to view today&apos;s service list.
                </Text>
              </Stack>
            )}
          </Card>
        </Stack>
      </OwnerShell>

      <Modal
        opened={walkInOpened}
        onClose={() => setWalkInOpened(false)}
        title={<Text fw={800}>Add walk-in</Text>}
        centered
        radius="lg"
      >
        <Stack gap="md">
          <Text size="sm" c={uiColors.textSecondary}>
            UI placeholder for guests who arrive without an online reservation.
          </Text>
          <TextInput label="Guest name" placeholder="Enter guest name" />
          <TextInput label="Phone" placeholder="Optional phone number" />
          <NumberInput
            label="Party size"
            min={1}
            max={20}
            defaultValue={2}
          />
          <Textarea label="Notes" placeholder="Seating or allergy notes" />
          <Group grow>
            <Button variant="default" onClick={() => setWalkInOpened(false)}>
              Cancel
            </Button>
            <Button onClick={() => setWalkInOpened(false)}>Add guest</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
