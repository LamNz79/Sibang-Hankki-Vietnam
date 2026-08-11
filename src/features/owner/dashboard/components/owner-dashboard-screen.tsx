"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Drawer,
  Group,
  Indicator,
  Modal,
  NumberInput,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAdjustmentsHorizontal,
  IconAlertCircle,
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconRosetteDiscountCheck,
  IconSearch,
  IconToolsKitchen3,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import {
  ChoiceButton,
  MetricCard,
  PrimaryActionButton,
} from "@/components/ui";
import { useOwnerReservations } from "@/features/owner/hooks/use-owner-reservations";
import { OwnerReservationRow } from "@/features/owner/reservations";
import { OwnerShell } from "@/features/owner/shared";
import {
  countOwnerReservationGuestFilter,
  countOwnerReservationStatus,
  isOwnerReservationActionRequired,
  isOwnerReservationActive,
  isOwnerReservationNextArrival,
  matchesOwnerReservationGuestFilters,
  matchesOwnerReservationSearch,
  matchesOwnerReservationStatus,
  type OwnerGuestFilter,
  type OwnerReservationFilter,
} from "@/features/owner/selectors/owner-reservation-selectors";
import {
  ReservationStatus,
  VisitStatus,
} from "@/features/reservations/types";
import { uiColors } from "@/theme";

const statusFilters: Array<{
  value: OwnerReservationFilter;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: ReservationStatus.Pending, label: "Pending" },
  {
    value: ReservationStatus.AlternativeProposed,
    label: "Waiting guest",
  },
  { value: ReservationStatus.Confirmed, label: "Confirmed" },
  { value: ReservationStatus.Declined, label: "Declined" },
  { value: VisitStatus.Arrived, label: "Arrived" },
  { value: VisitStatus.Seated, label: "Seated" },
  { value: VisitStatus.Completed, label: "Completed" },
];

const guestFilters: Array<{
  value: OwnerGuestFilter;
  label: string;
}> = [
  { value: "vip", label: "VIP" },
  { value: "pre-order", label: "Pre-order" },
  { value: "large-party", label: "4+ guests" },
];

/**
 * Owner daily operations dashboard with date navigation, reservation search,
 * status/guest filters, service metrics, and walk-in entry.
 */
export function OwnerDashboardScreen() {
  const ownerReservations = useOwnerReservations();
  const [selectedDate, setSelectedDate] = useState(dayjs().startOf("day"));
  const [statusFilter, setStatusFilter] =
    useState<OwnerReservationFilter>("all");
  const [guestFiltersActive, setGuestFiltersActive] = useState<OwnerGuestFilter[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpened, setFiltersOpened] = useState(false);
  const [walkInOpened, setWalkInOpened] = useState(false);

  const reservationsForSelectedDate = useMemo(
    () =>
      ownerReservations.filter((reservation) =>
        dayjs(reservation.date).isSame(selectedDate, "day"),
      ),
    [ownerReservations, selectedDate],
  );

  const reservationsMatchingSearch = useMemo(
    () =>
      reservationsForSelectedDate.filter((reservation) =>
        matchesOwnerReservationSearch(reservation, searchQuery),
      ),
    [reservationsForSelectedDate, searchQuery],
  );

  const reservationsMatchingGuest = useMemo(
    () =>
      reservationsMatchingSearch.filter((reservation) =>
        matchesOwnerReservationGuestFilters(reservation, guestFiltersActive),
      ),
    [guestFiltersActive, reservationsMatchingSearch],
  );

  const reservationsMatchingStatus = useMemo(
    () =>
      reservationsMatchingSearch.filter((reservation) =>
        matchesOwnerReservationStatus(reservation, statusFilter),
      ),
    [reservationsMatchingSearch, statusFilter],
  );

  const filteredReservations = useMemo(
    () =>
      reservationsMatchingSearch.filter(
        (reservation) =>
          matchesOwnerReservationStatus(reservation, statusFilter) &&
          matchesOwnerReservationGuestFilters(reservation, guestFiltersActive),
      ),
    [guestFiltersActive, reservationsMatchingSearch, statusFilter],
  );

  const actionRequiredReservations = reservationsForSelectedDate.filter(
    isOwnerReservationActionRequired,
  );
  const activeReservations = reservationsForSelectedDate.filter(
    isOwnerReservationActive,
  );
  const nextArrival = reservationsForSelectedDate.find(
    isOwnerReservationNextArrival,
  );
  const expectedGuests = activeReservations.reduce(
    (total, reservation) => total + reservation.partySize,
    0,
  );
  const preOrderCount = activeReservations.filter(
    (reservation) => reservation.preOrder,
  ).length;
  const vipCount = activeReservations.filter(
    (reservation) => reservation.tier === "vip",
  ).length;
  const isToday = selectedDate.isSame(dayjs(), "day");
  const dateLabel = isToday
    ? `Today · ${selectedDate.format("dddd, MMM D")}`
    : selectedDate.format("dddd, MMM D");
  const hasActiveFilters =
    statusFilter !== "all" || guestFiltersActive.length > 0;
  const activeFilterCount =
    (statusFilter === "all" ? 0 : 1) + guestFiltersActive.length;
  const isRefining = Boolean(searchQuery.trim()) || hasActiveFilters;

  const toggleGuestFilter = (filter: OwnerGuestFilter) => {
    setGuestFiltersActive((current) =>
      current.includes(filter)
        ? current.filter((value) => value !== filter)
        : [...current, filter],
    );
  };

  const metrics = [
    {
      value: String(activeReservations.length),
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

              <Group gap="sm" wrap="nowrap" align="center">
                <TextInput
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.currentTarget.value)}
                  placeholder="Guest name or booking code"
                  aria-label="Search reservations by guest name, booking code, or phone"
                  size="md"
                  radius="lg"
                  leftSection={<IconSearch size={18} />}
                  rightSection={
                    searchQuery ? (
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        radius="xl"
                        aria-label="Clear reservation search"
                        onClick={() => setSearchQuery("")}
                      >
                        <IconX size={16} />
                      </ActionIcon>
                    ) : null
                  }
                  styles={{
                    root: { flex: 1, minWidth: 0 },
                    input: {
                      height: 44,
                      background: uiColors.surface,
                      borderColor: uiColors.border,
                    },
                  }}
                />

                <Indicator
                  inline
                  disabled={activeFilterCount === 0}
                  label={activeFilterCount}
                  size={18}
                  color="warmCoral"
                  offset={4}
                >
                  <ActionIcon
                    size={44}
                    radius="lg"
                    variant={hasActiveFilters ? "light" : "default"}
                    color="warmCoral"
                    aria-label="Filter reservations"
                    onClick={() => setFiltersOpened(true)}
                    style={{
                      border: `1px solid ${
                        hasActiveFilters
                          ? uiColors.brandPrimary
                          : uiColors.border
                      }`,
                    }}
                  >
                    <IconAdjustmentsHorizontal size={20} />
                  </ActionIcon>
                </Indicator>
              </Group>
            </Stack>
          </Box>

          {!isRefining ? (
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
              {metrics.map((metric) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
            </SimpleGrid>
          ) : null}

          {!isRefining && actionRequiredReservations.length > 0 ? (
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
                    {actionRequiredReservations.length} reservation request
                    {actionRequiredReservations.length === 1
                      ? " needs"
                      : "s need"} review.
                  </Text>
                </Stack>
                <Link
                  href={`/owner/reservations/${actionRequiredReservations[0].id}`}
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

          {!isRefining && nextArrival ? (
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
            <Group justify="space-between" pt="md" pb="xs" wrap="nowrap">
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
                  {searchQuery ? "No reservations found" : "No reservations match"}
                </Text>
                <Text size="sm" ta="center" c={uiColors.textSecondary}>
                  {searchQuery
                    ? "Check the guest name, booking code, or phone number."
                    : "Try another status or guest filter."}
                </Text>
              </Stack>
            )}
          </Card>
        </Stack>
      </OwnerShell>

      <Drawer
        opened={filtersOpened}
        onClose={() => setFiltersOpened(false)}
        position="bottom"
        size="72%"
        radius="24px 24px 0 0"
        padding="md"
        title={<Text fw={800}>Filter reservations</Text>}
        classNames={{ content: "hide-scrollbar", body: "hide-scrollbar" }}
        styles={{
          content: {
            width: "100%",
            maxWidth: 560,
            marginLeft: "auto",
            marginRight: "auto",
            left: "50%",
            transform: "translateX(-50%)",
          },
          header: {
            borderBottom: `1px solid ${uiColors.border}`,
          },
        }}
      >
        <Stack gap="xl" pb="md">
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={800} c={uiColors.textPrimary}>
                Status
              </Text>
              <Text size="xs" c={uiColors.textSecondary}>
                Choose one
              </Text>
            </Group>
            <SimpleGrid cols={2} spacing="sm">
              {statusFilters.map((option) => (
                <ChoiceButton
                  key={option.value}
                  selected={statusFilter === option.value}
                  onClick={() => setStatusFilter(option.value)}
                >
                  {option.label} · {countOwnerReservationStatus(
                    reservationsMatchingGuest,
                    option.value,
                  )}
                </ChoiceButton>
              ))}
            </SimpleGrid>
          </Stack>

          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={800} c={uiColors.textPrimary}>
                Guest details
              </Text>
              <Text size="xs" c={uiColors.textSecondary}>
                Select any
              </Text>
            </Group>
            <SimpleGrid cols={2} spacing="sm">
              {guestFilters.map((option) => (
                <ChoiceButton
                  key={option.value}
                  selected={guestFiltersActive.includes(option.value)}
                  onClick={() => toggleGuestFilter(option.value)}
                >
                  {option.label} · {countOwnerReservationGuestFilter(
                    reservationsMatchingStatus,
                    option.value,
                  )}
                </ChoiceButton>
              ))}
            </SimpleGrid>
          </Stack>

          <Group grow gap="sm">
            <Button
              variant="default"
              size="md"
              disabled={!hasActiveFilters}
              onClick={() => {
                setStatusFilter("all");
                setGuestFiltersActive([]);
              }}
            >
              Reset
            </Button>
            <Button size="md" onClick={() => setFiltersOpened(false)}>
              Show {filteredReservations.length} reservations
            </Button>
          </Group>
        </Stack>
      </Drawer>

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
