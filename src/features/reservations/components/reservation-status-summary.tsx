import { Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import {
  IconCalendarClock,
  IconCheck,
  IconClock,
  IconX,
} from "@tabler/icons-react";
import { StatusBadge } from "@/components/ui";
import { getReservationStatusFlags } from "@/features/reservations/domain/selectors";
import {
  ReservationCustomerAction,
  type CustomerReservation,
} from "@/features/reservations/types";
import { uiColors } from "@/theme";

type ReservationStatusSummaryProps = {
  reservation: CustomerReservation;
};

/** Maps reservation state to the customer-facing status summary. */
export function ReservationStatusSummary({
  reservation,
}: ReservationStatusSummaryProps) {
  const { isPending, isAlternative, isDeclined } =
    getReservationStatusFlags(reservation);
  const wasDeclinedByCustomer =
    reservation.customerAction ===
    ReservationCustomerAction.DeclinedAlternative;
  const background = isPending
    ? uiColors.statusWarningSurface
    : isAlternative
      ? uiColors.brandPrimarySubtle
      : isDeclined
        ? uiColors.statusErrorSurface
        : uiColors.statusSuccessSurface;
  const borderColor = isPending
    ? uiColors.statusWarningBorder
    : isAlternative
      ? uiColors.brandPrimary
      : isDeclined
        ? uiColors.statusErrorText
        : uiColors.statusSuccessText;

  return (
    <Card
      radius="lg"
      p="md"
      style={{
        background,
        border: `1px solid ${borderColor}`,
      }}
    >
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon
          size={44}
          radius="xl"
          variant="light"
          color={
            isPending
              ? "sand"
              : isAlternative
                ? "warmCoral"
                : isDeclined
                  ? "red"
                  : "teal"
          }
          style={{ flexShrink: 0 }}
        >
          {isPending ? (
            <IconClock size={22} />
          ) : isAlternative ? (
            <IconCalendarClock size={22} />
          ) : isDeclined ? (
            <IconX size={22} />
          ) : (
            <IconCheck size={22} />
          )}
        </ThemeIcon>
        <Stack gap={2}>
          <StatusBadge
            tone={
              isPending
                ? "warning"
                : isAlternative
                  ? "brand"
                  : isDeclined
                    ? "error"
                    : "success"
            }
            w="fit-content"
          >
            {isPending
              ? "Pending confirmation"
              : isAlternative
                ? "Action required"
                : isDeclined
                  ? "Request declined"
                  : "Reservation confirmed"}
          </StatusBadge>
          <Text fw={800} c={uiColors.textPrimary}>
            {isPending
              ? "Waiting for the restaurant"
              : isAlternative
                ? "The restaurant suggested a new time"
              : isDeclined
                  ? wasDeclinedByCustomer
                    ? "This request is closed"
                    : "The restaurant could not confirm this request"
                  : "Your table is confirmed"}
          </Text>
          <Text size="xs" c={uiColors.textSecondary}>
            {isPending
              ? "The restaurant will confirm your request or contact you if anything needs to change."
              : isAlternative
                ? "Review the proposed time below. Your table is not confirmed until you accept it."
              : isDeclined
                  ? wasDeclinedByCustomer
                    ? "The restaurant has been notified that you declined the proposed time."
                    : "No table is being held. Choose another time when you are ready."
                  : "Your reservation is ready. Show the booking code when you arrive."}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}
