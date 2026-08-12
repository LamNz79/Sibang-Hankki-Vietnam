import Link from "next/link";
import {
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCalendarEvent,
  IconChevronRight,
  IconRosetteDiscountCheck,
  IconToolsKitchen3,
  IconUsers,
} from "@tabler/icons-react";
import { MetricCard } from "@/components/ui";
import type { OwnerDashboardSummary } from "@/features/owner/dashboard/hooks/use-owner-dashboard";
import type { OwnerReservation } from "@/features/owner/types";
import { uiColors } from "@/theme";

type OwnerDashboardOverviewProps = {
  summary: OwnerDashboardSummary;
  actionRequiredReservations: OwnerReservation[];
  nextArrival?: OwnerReservation;
};

/** Service metrics and priority cards shown when the dashboard is not filtered. */
export function OwnerDashboardOverview({
  summary,
  actionRequiredReservations,
  nextArrival,
}: OwnerDashboardOverviewProps) {
  const metrics = [
    {
      value: String(summary.bookings),
      label: "Bookings",
      icon: IconCalendarEvent,
    },
    {
      value: String(summary.expectedGuests),
      label: "Expected guests",
      icon: IconUsers,
    },
    {
      value: String(summary.preOrders),
      label: "Pre-orders",
      icon: IconToolsKitchen3,
    },
    {
      value: String(summary.vipGuests),
      label: "VIP guests",
      icon: IconRosetteDiscountCheck,
    },
  ];

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </SimpleGrid>

      {actionRequiredReservations.length > 0 ? (
        <Card
          radius="lg"
          p="md"
          style={{
            background: uiColors.statusWarningSurface,
            border: `1px solid ${uiColors.statusWarningBorder}`,
          }}
        >
          <Group gap="sm" wrap="nowrap" align="flex-start">
            <ThemeIcon size={40} radius="xl" variant="light" color="sand">
              <IconAlertCircle size={20} />
            </ThemeIcon>
            <Stack gap={3} style={{ flex: 1 }}>
              <Text fw={800} c={uiColors.statusWarningTextStrong}>
                Needs attention
              </Text>
              <Text size="sm" c={uiColors.statusWarningTextStrong}>
                {actionRequiredReservations.length} reservation request
                {actionRequiredReservations.length === 1 ? " needs" : "s need"}{" "}
                review.
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
    </Stack>
  );
}
