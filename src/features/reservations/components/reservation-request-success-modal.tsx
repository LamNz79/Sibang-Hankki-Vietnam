import dayjs from "dayjs";
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
import { StatusBadge } from "@/components/ui";
import type { CustomerReservation } from "@/features/reservations/types";
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
                ? "New time request sent"
                : "Reservation request sent"}
            </Text>
            <Text size="sm" ta="center" c={uiColors.textSecondary}>
              The restaurant will review your request and confirm it or contact
              you if anything needs to change.
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
                <StatusBadge tone="warning">Pending confirmation</StatusBadge>
              </Group>
              <Group gap="xs" wrap="nowrap">
                <IconCalendarEvent size={17} color={uiColors.brandPrimary} />
                <Text size="sm">
                  {dayjs(reservation.date).format("ddd, MMM D, YYYY")}
                </Text>
              </Group>
              <Group gap="xs" wrap="nowrap">
                <IconClock size={17} color={uiColors.brandPrimary} />
                <Text size="sm">{reservation.time}</Text>
              </Group>
              <Group gap="xs" wrap="nowrap">
                <IconUsers size={17} color={uiColors.brandPrimary} />
                <Text size="sm">
                  {reservation.guests} guests · {reservation.district}
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
              View reservation details
            </Button>
            <Button
              fullWidth
              size="lg"
              radius="md"
              variant="subtle"
              color="gray"
              onClick={onExploreRestaurants}
            >
              Explore more restaurants
            </Button>
          </Stack>
        </Stack>
      ) : null}
    </Modal>
  );
}
