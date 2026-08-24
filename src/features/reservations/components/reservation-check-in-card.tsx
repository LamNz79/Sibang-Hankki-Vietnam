import { Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconClock, IconQrcode } from "@tabler/icons-react";
import { QRCodeSVG } from "qrcode.react";
import { getReservationStatusFlags } from "@/features/reservations/domain/selectors";
import type { CustomerReservation } from "@/features/reservations/types";
import { uiColors } from "@/theme";

type ReservationCheckInCardProps = {
  reservation: CustomerReservation;
};

/** Explains whether arrival credentials are ready for the current status. */
export function ReservationCheckInCard({
  reservation,
}: ReservationCheckInCardProps) {
  const { isPending, isAlternative, isConfirmed, isDeclined } =
    getReservationStatusFlags(reservation);
  const isAwaitingConfirmation = isPending || isAlternative || isDeclined;

  if (isConfirmed && reservation.checkInToken) {
    return (
      <Card
        radius="lg"
        p="md"
        style={{
          border: `1px solid ${uiColors.border}`,
          background: uiColors.surfaceAlt,
        }}
      >
        <Stack gap="md" align="center">
          <Group gap="sm" wrap="nowrap" align="flex-start" w="100%">
            <ThemeIcon radius="md" size={38} variant="light" color="warmCoral">
              <IconQrcode size={19} />
            </ThemeIcon>
            <Stack gap={2}>
              <Text fw={750} size="sm" c={uiColors.textPrimary}>
                Your check-in QR code
              </Text>
              <Text size="xs" c={uiColors.textSecondary}>
                Show this code to the restaurant when you arrive.
              </Text>
            </Stack>
          </Group>
          <div
            style={{
              padding: 12,
              background: "white",
              borderRadius: 12,
              lineHeight: 0,
            }}
          >
            <QRCodeSVG
              value={reservation.checkInToken}
              size={184}
              level="M"
              title="Reservation check-in QR code"
            />
          </div>
        </Stack>
      </Card>
    );
  }

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
