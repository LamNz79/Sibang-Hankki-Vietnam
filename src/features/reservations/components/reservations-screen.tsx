"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import {
  Alert,
  Box,
  Button,
  Card,
  Center,
  Group,
  Loader,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import {
  IconCalendarCheck,
  IconCalendarEvent,
  IconChevronRight,
  IconClock,
  IconSearch,
  IconUsers,
} from "@tabler/icons-react";
import { BottomNav, MobileShell } from "@/components/layout/customer";
import { StatusBadge } from "@/components/ui";
import {
  getCustomerReservationDisplayStatus,
  getReservationDisplaySlot,
  getReservationStatusFlags,
  partitionCustomerReservations,
} from "@/features/reservations/domain/selectors";
import { useCustomerReservationsState } from "@/features/reservations/hooks/use-customer-reservations";
import {
  ReservationStatus,
  VisitStatus,
  type CustomerReservation,
} from "@/features/reservations/types";
import { uiColors } from "@/theme";

type ReservationScope = "upcoming" | "past" | "all";
type ReservationStatusFilter =
  | "all"
  | "action"
  | "pending"
  | "confirmed"
  | "checked-in"
  | "completed"
  | "closed";

const PAGE_SIZE = 8;

function matchesStatus(
  reservation: CustomerReservation,
  filter: ReservationStatusFilter,
) {
  if (filter === "all") return true;
  if (filter === "action") {
    return reservation.status === ReservationStatus.AlternativeProposed;
  }
  if (filter === "pending") {
    return reservation.status === ReservationStatus.Pending;
  }
  if (filter === "confirmed") {
    return (
      reservation.status === ReservationStatus.Confirmed &&
      (!reservation.visitStatus || reservation.visitStatus === VisitStatus.Expected)
    );
  }
  if (filter === "checked-in") {
    return (
      reservation.visitStatus === VisitStatus.Arrived ||
      reservation.visitStatus === VisitStatus.Seated
    );
  }
  if (filter === "completed") {
    return reservation.visitStatus === VisitStatus.Completed;
  }
  return (
    reservation.status === ReservationStatus.Declined ||
    reservation.status === ReservationStatus.Expired ||
    reservation.status === ReservationStatus.Cancelled ||
    reservation.visitStatus === VisitStatus.NoShow
  );
}

function ReservationCards({
  reservations,
}: {
  reservations: CustomerReservation[];
}) {
  const format = useFormatter();
  const t = useTranslations("CustomerReservations");

  return (
    <Stack gap="md">
      {reservations.map((reservation) => {
        const {
          isPending,
          isAlternative,
          isDeclined,
          isCancelled,
        } = getReservationStatusFlags(reservation);
        const displaySlot = getReservationDisplaySlot(reservation);
        const displayStatus = getCustomerReservationDisplayStatus(reservation);
        const isExpired = reservation.status === ReservationStatus.Expired;
        const isUnavailable =
          isDeclined ||
          isExpired ||
          isCancelled ||
          displayStatus === VisitStatus.NoShow;

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
                        : isUnavailable
                          ? "error"
                          : "success"
                  }
                  w="fit-content"
                >
                  {isPending
                    ? t("status.pending")
                    : isAlternative
                      ? t("status.action")
                      : isCancelled
                        ? t("status.cancelled")
                        : isExpired
                          ? t("status.expired")
                          : isDeclined
                            ? t("status.declined")
                            : displayStatus === VisitStatus.Arrived
                              ? t("status.checkedIn")
                              : displayStatus === VisitStatus.Seated
                                ? t("status.seated")
                                : displayStatus === VisitStatus.Completed
                                  ? t("status.completed")
                                  : displayStatus === VisitStatus.NoShow
                                    ? t("status.noShow")
                                    : t("status.confirmed")}
                </StatusBadge>
                <Text fw={750} c={uiColors.textPrimary}>
                  {reservation.restaurantName}
                </Text>
                <Group gap={6} wrap="nowrap">
                  <IconCalendarEvent
                    size={15}
                    color={uiColors.textSecondary}
                  />
                  <Text size="xs" c={uiColors.textSecondary}>
                    {format.dateTime(new Date(`${displaySlot.date}T00:00:00`), {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
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
                      ? t("suggestedTime", { time: displaySlot.time })
                      : displaySlot.time}
                  </Text>
                </Group>
                <Group gap={6} wrap="nowrap">
                  <IconUsers size={15} color={uiColors.textSecondary} />
                  <Text size="xs" c={uiColors.textSecondary}>
                    {t("guestLocation", {
                      count: reservation.guests,
                      district: reservation.district,
                    })}
                  </Text>
                </Group>
              </Stack>

              <IconChevronRight size={18} color={uiColors.textMuted} />
            </Group>
          </Card>
        );
      })}
    </Stack>
  );
}

/** Lists customer reservations with status-aware dates, times, and actions. */
export function ReservationsScreen() {
  const t = useTranslations("CustomerReservations");
  const { reservations, isLoading, isError, retry } =
    useCustomerReservationsState();
  const [scope, setScope] = useState<ReservationScope>("upcoming");
  const [statusFilter, setStatusFilter] =
    useState<ReservationStatusFilter>("all");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { upcoming, past } = partitionCustomerReservations(
    reservations,
    dayjs().format("YYYY-MM-DDTHH:mm"),
  );
  const filteredReservations = useMemo(() => {
    const scoped =
      scope === "upcoming"
        ? upcoming
        : scope === "past"
          ? past
          : [...upcoming, ...past];
    const normalizedQuery = query.trim().toLowerCase();

    return scoped.filter((reservation) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [
          reservation.restaurantName,
          reservation.reference,
          reservation.district,
        ].some((value) => value?.toLowerCase().includes(normalizedQuery));
      return matchesQuery && matchesStatus(reservation, statusFilter);
    });
  }, [past, query, scope, statusFilter, upcoming]);
  const visibleReservations = filteredReservations.slice(0, visibleCount);
  const hasFilters = query.trim().length > 0 || statusFilter !== "all";

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <MobileShell
      title={t("title")}
      subtitle={t("subtitle")}
      bottomNav={<BottomNav activePath="/reservations" />}
    >
      <Stack gap={6} align="center" py="sm">
        <ThemeIcon size={52} radius={999} color="warmCoral" variant="light">
          <IconCalendarCheck size={26} />
        </ThemeIcon>
        <Text fw={800} size="lg" c={uiColors.textPrimary}>
          {t("heading")}
        </Text>
        <Text size="sm" c={uiColors.textSecondary}>
          {t("description")}
        </Text>
      </Stack>

      <Stack gap="sm">
        <SegmentedControl
          fullWidth
          value={scope}
          onChange={(value) => {
            setScope(value as ReservationScope);
            setVisibleCount(PAGE_SIZE);
          }}
          data={[
            { label: t("scope.upcoming", { count: upcoming.length }), value: "upcoming" },
            { label: t("scope.history", { count: past.length }), value: "past" },
            { label: t("scope.all", { count: reservations.length }), value: "all" },
          ]}
          color="warmCoral"
          radius="md"
        />
        <TextInput
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            setVisibleCount(PAGE_SIZE);
          }}
          leftSection={<IconSearch size={16} />}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchLabel")}
          radius="md"
        />
        <Select
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter((value ?? "all") as ReservationStatusFilter);
            setVisibleCount(PAGE_SIZE);
          }}
          data={[
            { label: t("filters.all"), value: "all" },
            { label: t("filters.action"), value: "action" },
            { label: t("filters.pending"), value: "pending" },
            { label: t("filters.confirmed"), value: "confirmed" },
            { label: t("filters.checkedIn"), value: "checked-in" },
            { label: t("filters.completed"), value: "completed" },
            { label: t("filters.closed"), value: "closed" },
          ]}
          allowDeselect={false}
          radius="md"
          aria-label={t("filterLabel")}
        />
      </Stack>

      {isLoading ? (
        <Center py="xl">
          <Loader color="warmCoral" />
        </Center>
      ) : isError ? (
        <Alert color="red" title={t("loadError.title")}>
          <Stack gap="sm">
            <Text size="sm">{t("loadError.description")}</Text>
            <Button variant="light" color="red" onClick={() => void retry()}>
              {t("loadError.retry")}
            </Button>
          </Stack>
        </Alert>
      ) : visibleReservations.length > 0 ? (
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" c={uiColors.textSecondary}>
              {t("showing", {
                visible: visibleReservations.length,
                total: filteredReservations.length,
              })}
            </Text>
            {hasFilters ? (
              <Button variant="subtle" color="gray" size="compact-sm" onClick={clearFilters}>
                {t("clearFilters")}
              </Button>
            ) : null}
          </Group>
          <ReservationCards reservations={visibleReservations} />
          {visibleCount < filteredReservations.length ? (
            <Button
              variant="default"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              {t("showMore", { count: filteredReservations.length - visibleCount })}
            </Button>
          ) : null}
        </Stack>
      ) : (
        <Card
          radius="lg"
          p="xl"
          style={{
            border: `1px dashed ${uiColors.borderStrong}`,
            background: uiColors.surfaceAlt,
          }}
        >
          <Stack align="center" gap="sm">
            <Text fw={700} c={uiColors.textPrimary}>
              {hasFilters
                ? t("empty.filteredTitle")
                : scope === "past"
                  ? t("empty.historyTitle")
                  : t("empty.upcomingTitle")}
            </Text>
            <Text size="sm" ta="center" c={uiColors.textSecondary}>
              {hasFilters
                ? t("empty.filteredDescription")
                : scope === "past"
                  ? t("empty.historyDescription")
                  : t("empty.upcomingDescription")}
            </Text>
            {hasFilters ? (
              <Button variant="light" color="gray" fullWidth onClick={clearFilters}>
                {t("clearFilters")}
              </Button>
            ) : scope !== "past" ? (
              <Button
                component={Link}
                href="/restaurants"
                color="warmCoral"
                radius="md"
                size="md"
                fullWidth
                style={{
                  background: uiColors.brandPrimary,
                  color: uiColors.surface,
                }}
              >
                {t("exploreRestaurants")}
              </Button>
            ) : null}
          </Stack>
        </Card>
      )}
    </MobileShell>
  );
}
