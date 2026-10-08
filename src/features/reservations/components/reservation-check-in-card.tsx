"use client";

import { Button, Card, Center, Group, Loader, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconClock, IconQrcode } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import { getReservationStatusFlags } from "@/features/reservations/domain/selectors";
import { useCustomerCheckInToken } from "@/features/reservations/hooks/use-customer-reservations";
import type { CustomerReservation } from "@/features/reservations/types";
import { VisitStatus } from "@/features/reservations/types";
import { uiColors } from "@/theme";

type ReservationCheckInCardProps = {
  reservation: CustomerReservation;
};

/** Explains whether arrival credentials are ready for the current status. */
export function ReservationCheckInCard({
  reservation,
}: ReservationCheckInCardProps) {
  const t = useTranslations("ReservationQr");
  const { isPending, isAlternative, isConfirmed, isDeclined, isCancelled } =
    getReservationStatusFlags(reservation);
  const checkInToken = useCustomerCheckInToken(reservation);
  const hasCheckedIn =
    isConfirmed &&
    reservation.visitStatus !== undefined &&
    reservation.visitStatus !== VisitStatus.Expected;
  const isAwaitingConfirmation =
    isPending || isAlternative || isDeclined || isCancelled;

  if (isConfirmed && !hasCheckedIn) {
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
          {checkInToken.isPending ? (
            <Center mih={184}><Loader size="sm" /></Center>
          ) : checkInToken.isError ? (
            <Stack align="center" gap="xs">
              <Text size="sm" c="red" ta="center">{t("detail.errorDescription")}</Text>
              <Button size="compact-sm" variant="light" onClick={() => checkInToken.refetch()}>
                {t("detail.retry")}
              </Button>
            </Stack>
          ) : checkInToken.data ? (
            <div
              style={{
                padding: 12,
                background: "white",
                borderRadius: 12,
                lineHeight: 0,
              }}
            >
              <QRCodeSVG
                value={checkInToken.data}
                size={184}
                level="M"
                title={t("ariaTitle")}
              />
            </div>
          ) : null}
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
            {hasCheckedIn
              ? t("detail.checkedInTitle")
              : isPending
              ? t("detail.pendingTitle")
              : isAlternative
                ? t("detail.alternativeTitle")
                : isDeclined || isCancelled
                  ? t("detail.declinedTitle")
                  : t("detail.fallbackTitle")}
          </Text>
          <Text size="xs" c={uiColors.textSecondary}>
            {hasCheckedIn
              ? t("detail.checkedInDescription")
              : isPending
              ? t("detail.pendingDescription")
              : isAlternative
                ? t("detail.alternativeDescription")
                : isDeclined || isCancelled
                  ? t("detail.declinedDescription")
                  : t("detail.fallbackDescription")}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}
