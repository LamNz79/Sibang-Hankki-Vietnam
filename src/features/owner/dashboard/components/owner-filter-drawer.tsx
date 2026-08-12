import { Button, Drawer, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { ChoiceButton } from "@/components/ui";
import {
  type OwnerGuestFilter,
  type OwnerReservationFilter,
} from "@/features/owner/selectors/owner-reservation-selectors";
import { ReservationStatus, VisitStatus } from "@/features/reservations/types";
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

const guestFilterOptions: Array<{
  value: OwnerGuestFilter;
  label: string;
}> = [
  { value: "vip", label: "VIP" },
  { value: "pre-order", label: "Pre-order" },
  { value: "large-party", label: "4+ guests" },
];

type OwnerFilterDrawerProps = {
  opened: boolean;
  statusFilter: OwnerReservationFilter;
  guestFilters: OwnerGuestFilter[];
  hasActiveFilters: boolean;
  reservationCount: number;
  onClose: () => void;
  onStatusChange: (filter: OwnerReservationFilter) => void;
  onGuestFilterToggle: (filter: OwnerGuestFilter) => void;
  onReset: () => void;
  getStatusCount: (filter: OwnerReservationFilter) => number;
  getGuestCount: (filter: OwnerGuestFilter) => number;
};

/** Mobile-width filter drawer for owner reservation status and guest details. */
export function OwnerFilterDrawer({
  opened,
  statusFilter,
  guestFilters,
  hasActiveFilters,
  reservationCount,
  onClose,
  onStatusChange,
  onGuestFilterToggle,
  onReset,
  getStatusCount,
  getGuestCount,
}: OwnerFilterDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
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
                onClick={() => onStatusChange(option.value)}
              >
                {option.label} · {getStatusCount(option.value)}
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
            {guestFilterOptions.map((option) => (
              <ChoiceButton
                key={option.value}
                selected={guestFilters.includes(option.value)}
                onClick={() => onGuestFilterToggle(option.value)}
              >
                {option.label} · {getGuestCount(option.value)}
              </ChoiceButton>
            ))}
          </SimpleGrid>
        </Stack>

        <Group grow gap="sm">
          <Button
            variant="default"
            size="md"
            disabled={!hasActiveFilters}
            onClick={onReset}
          >
            Reset
          </Button>
          <Button size="md" onClick={onClose}>
            Show {reservationCount} reservations
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
