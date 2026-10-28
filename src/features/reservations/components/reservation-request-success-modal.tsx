import {
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconClock,
  IconUsers,
} from "@tabler/icons-react";
import { useFormatter, useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui";
import type { CustomerReservation } from "@/features/reservations/types";
import { ReservationStatus } from "@/features/reservations/types";
import { restaurantTimeZone, toRestaurantDate } from "@/lib/date-time";
import { uiColors } from "@/theme";

type ReservationRequestSuccessModalProps = {
  opened: boolean;
  reservation: CustomerReservation | null;
  isChangeRequest: boolean;
  onClose: () => void;
  onViewDetails: (reservation: CustomerReservation) => void;
  onExploreRestaurants: () => void;
};

/** Confirms a pending request and offers the customer's next navigation steps. */
export function ReservationRequestSuccessModal({
  opened,
  reservation,
  isChangeRequest,
  onClose,
  onViewDetails,
  onExploreRestaurants,
}: ReservationRequestSuccessModalProps) {
  const format = useFormatter();
  const t = useTranslations("CustomerBooking.success");
  const confirmed = reservation?.status === ReservationStatus.Confirmed;
  const displayDate = reservation
    ? reservation.changeRequest?.date ?? reservation.date
    : "";
  const displayTime = reservation
    ? reservation.changeRequest?.time ?? reservation.time
    : "";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      title={null}
      radius="xl"
      padding="xl"
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      styles={{
        inner: { padding: 16 },
        content: { width: "100%", maxWidth: 528 },
        body: { paddingTop: 8 },
      }}
    >
      {reservation ? (
        <Stack gap="lg" align="center">
          <ThemeIcon size={68} radius={999} color="warmCoral" variant="light">
            <IconClock size={34} stroke={2.3} />
          </ThemeIcon>

          <Stack gap={4} align="center">
            <Text fw={800} size="xl" ta="center" c={uiColors.textPrimary}>
              {isChangeRequest
                ? t("changeTitle")
                : confirmed
                  ? t("confirmedTitle")
                  : t("pendingTitle")}
            </Text>
            <Text size="sm" ta="center" c={uiColors.textSecondary}>
              {isChangeRequest
                ? confirmed
                  ? t("confirmedChangeDescription")
                  : t("pendingChangeDescription")
                : confirmed
                ? t("confirmedDescription")
                : t("pendingDescription")}
            </Text>
          </Stack>

          <Card
            w="100%"
            radius="lg"
            p="md"
            style={{
              border: `1px solid ${uiColors.border}`,
              background: uiColors.surfaceAlt,
            }}
          >
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Text fw={700} c={uiColors.textPrimary}>
                  {reservation.restaurantName}
                </Text>
                <StatusBadge tone={isChangeRequest ? "warning" : confirmed ? "success" : "warning"}>
                  {isChangeRequest
                    ? t("changePending")
                    : confirmed
                      ? t("confirmed")
                      : t("pendingConfirmation")}
                </StatusBadge>
              </Group>
              <Group gap="xs" wrap="nowrap">
                <IconCalendarEvent size={17} color={uiColors.brandPrimary} />
                <Text size="sm">
                  {format.dateTime(toRestaurantDate(displayDate), {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    timeZone: restaurantTimeZone,
                  })}
                </Text>
              </Group>
              <Group gap="xs" wrap="nowrap">
                <IconClock size={17} color={uiColors.brandPrimary} />
                <Text size="sm">{displayTime}</Text>
              </Group>
              <Group gap="xs" wrap="nowrap">
                <IconUsers size={17} color={uiColors.brandPrimary} />
                <Text size="sm">
                  {t("guestLocation", {
                    count: reservation.guests,
                    district: reservation.district,
                  })}
                </Text>
              </Group>
            </Stack>
          </Card>

          <Stack w="100%" gap="sm">
            <Button
              fullWidth
              size="lg"
              radius="md"
              color="warmCoral"
              onClick={() => onViewDetails(reservation)}
            >
              {t("viewDetails")}
            </Button>
            <Button
              fullWidth
              size="lg"
              radius="md"
              variant="subtle"
              color="gray"
              onClick={onExploreRestaurants}
            >
              {t("exploreRestaurants")}
            </Button>
          </Stack>
        </Stack>
      ) : null}
    </Modal>
  );
}
