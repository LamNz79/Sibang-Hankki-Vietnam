import { Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconClock, IconQrcode } from "@tabler/icons-react";
import { getReservationStatusFlags } from "@/features/reservations/domain/selectors";
import type { CustomerReservation } from "@/features/reservations/types";
import { uiColors } from "@/theme";

type ReservationArrivalGuidanceCardProps = {
  reservation: CustomerReservation;
};

/** Explains whether arrival credentials are ready for the current status. */
export function ReservationArrivalGuidanceCard({
  reservation,
}: ReservationArrivalGuidanceCardProps) {
  const { isPending, isAlternative, isDeclined } =
    getReservationStatusFlags(reservation);
  const isAwaitingConfirmation = isPending || isAlternative || isDeclined;

  return (
    <Card
      radius="lg"
      p="md"
      style={{
        border: `1px solid ${uiColors.border}`,
        background:
          isPending || isAlternative
            ? uiColors.statusInfoSurface
            : uiColors.surfaceAlt,
      }}
    >
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <ThemeIcon
          radius="md"
          size={38}
          variant="light"
          color={isAwaitingConfirmation ? "gray" : "warmCoral"}
          style={{ flexShrink: 0 }}
        >
          {isAwaitingConfirmation ? (
            <IconClock size={19} />
          ) : (
            <IconQrcode size={19} />
          )}
        </ThemeIcon>
        <Stack gap={2}>
          <Text fw={750} size="sm" c={uiColors.textPrimary}>
            {isPending
              ? "Check-in code available after confirmation"
              : isAlternative
                ? "Respond before this booking can be confirmed"
                : isDeclined
                  ? "No table is being held"
                  : "Show your reservation when you arrive"}
          </Text>
          <Text size="xs" c={uiColors.textSecondary}>
            {isPending
              ? "The restaurant may contact you before confirming this request."
              : isAlternative
                ? "Accept the suggested time, choose another time, or decline the request."
                : isDeclined
                  ? "Make a new request whenever you are ready."
                  : "Staff can confirm your booking code or check you in with the QR code."}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}
