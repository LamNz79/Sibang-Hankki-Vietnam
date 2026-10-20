import { Button, Drawer, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { ChoiceButton } from "@/components/ui";
import {
  type OwnerGuestFilter,
  type OwnerReservationFilter,
} from "@/features/owner/selectors/owner-reservation-selectors";
import { ReservationStatus, VisitStatus } from "@/features/reservations/types";
import { uiColors } from "@/theme";

const statusFilters: Array<{
  value: OwnerReservationFilter;
  labelKey: "all" | "pending" | "waitingGuest" | "confirmed" | "declined" | "expired" | "cancelled" | "arrived" | "seated" | "completed" | "noShow";
}> = [
  { value: "all", labelKey: "all" },
  { value: ReservationStatus.Pending, labelKey: "pending" },
  {
    value: ReservationStatus.AlternativeProposed,
    labelKey: "waitingGuest",
  },
  { value: ReservationStatus.Confirmed, labelKey: "confirmed" },
  { value: ReservationStatus.Declined, labelKey: "declined" },
  { value: ReservationStatus.Expired, labelKey: "expired" },
  { value: ReservationStatus.Cancelled, labelKey: "cancelled" },
  { value: VisitStatus.Arrived, labelKey: "arrived" },
  { value: VisitStatus.Seated, labelKey: "seated" },
  { value: VisitStatus.Completed, labelKey: "completed" },
  { value: VisitStatus.NoShow, labelKey: "noShow" },
];

const guestFilterOptions: Array<{
  value: OwnerGuestFilter;
  labelKey: "vip" | "preOrder" | "largeParty";
}> = [
  { value: "vip", labelKey: "vip" },
  { value: "pre-order", labelKey: "preOrder" },
  { value: "large-party", labelKey: "largeParty" },
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
  const t = useTranslations("OwnerDashboard.filters");

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="72%"
      radius="24px 24px 0 0"
      padding="md"
      title={<Text fw={800}>{t("title")}</Text>}
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
              {t("status")}
            </Text>
            <Text size="xs" c={uiColors.textSecondary}>
              {t("chooseOne")}
            </Text>
          </Group>
          <SimpleGrid cols={2} spacing="sm">
            {statusFilters.map((option) => (
              <ChoiceButton
                key={option.value}
                selected={statusFilter === option.value}
                onClick={() => onStatusChange(option.value)}
              >
                {t(`statuses.${option.labelKey}`)} · {getStatusCount(option.value)}
              </ChoiceButton>
            ))}
          </SimpleGrid>
        </Stack>

        <Stack gap="sm">
          <Group justify="space-between">
            <Text fw={800} c={uiColors.textPrimary}>
              {t("guestDetails")}
            </Text>
            <Text size="xs" c={uiColors.textSecondary}>
              {t("selectAny")}
            </Text>
          </Group>
          <SimpleGrid cols={2} spacing="sm">
            {guestFilterOptions.map((option) => (
              <ChoiceButton
                key={option.value}
                selected={guestFilters.includes(option.value)}
                onClick={() => onGuestFilterToggle(option.value)}
              >
                {t(`guests.${option.labelKey}`)} · {getGuestCount(option.value)}
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
            {t("reset")}
          </Button>
          <Button size="md" onClick={onClose}>
            {t("show", { count: reservationCount })}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
