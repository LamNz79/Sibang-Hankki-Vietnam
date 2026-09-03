"use client";

import { Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconClock, IconQrcode } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("ReservationQr");
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
                {t("detail.readyTitle")}
              </Text>
              <Text size="xs" c={uiColors.textSecondary}>
                {t("detail.readyDescription")}
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
              title={t("ariaTitle")}
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
              ? t("detail.pendingTitle")
              : isAlternative
                ? t("detail.alternativeTitle")
                : isDeclined
                  ? t("detail.declinedTitle")
                  : t("detail.fallbackTitle")}
          </Text>
          <Text size="xs" c={uiColors.textSecondary}>
            {isPending
              ? t("detail.pendingDescription")
              : isAlternative
                ? t("detail.alternativeDescription")
                : isDeclined
                  ? t("detail.declinedDescription")
                  : t("detail.fallbackDescription")}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}
