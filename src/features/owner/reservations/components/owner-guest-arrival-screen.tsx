"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, SimpleGrid, Stack, Text } from "@mantine/core";
import {
  IconCheck,
  IconCircleCheck,
  IconSofa,
  IconUserCheck,
} from "@tabler/icons-react";
import { ChoiceButton } from "@/components/ui";
import {
  checkInOwnerReservation,
  updateOwnerVisitStatus,
} from "@/features/owner/data/owner-reservation-storage";
import { useOwnerReservation } from "@/features/owner/hooks/use-owner-reservations";
import { canOwnerReservationCheckIn } from "@/features/owner/selectors/owner-reservation-selectors";
import { OwnerShell } from "@/features/owner/shared";
import { VisitStatus } from "@/features/reservations/types";
import { uiColors } from "@/theme";
import { OwnerReservationSummaryCard } from "./owner-reservation-summary-card";
import { OwnerServiceNotesCard } from "./owner-service-notes-card";

const arrivalStatuses: Array<{
  value: VisitStatus;
  icon: typeof IconCheck;
}> = [
  { value: VisitStatus.Expected, icon: IconCheck },
  { value: VisitStatus.Arrived, icon: IconUserCheck },
  { value: VisitStatus.Seated, icon: IconSofa },
  { value: VisitStatus.Completed, icon: IconCircleCheck },
];

export function OwnerGuestArrivalScreen() {
  const t = useTranslations("OwnerCheckIn.arrival");
  const params = useParams<{ id: string }>();
  const reservation = useOwnerReservation(params.id);

  if (!reservation) {
    return (
      <OwnerShell title={t("title")} backHref="/owner">
        <Card p="xl">
          <Text fw={700}>{t("notFound")}</Text>
        </Card>
      </OwnerShell>
    );
  }

  const canCheckIn = canOwnerReservationCheckIn(reservation);

  return (
    <OwnerShell
      title={t("title")}
      eyebrow={t("eyebrow")}
      backHref={`/owner/reservations/${reservation.id}`}
    >
      <Stack gap="md">
        <OwnerReservationSummaryCard
          reservation={reservation}
          status={
            reservation.visitStatus === VisitStatus.Expected
              ? reservation.reservationStatus
              : reservation.visitStatus
          }
        />

        <OwnerServiceNotesCard note={reservation.note} />

        <Stack gap="sm">
          <Text fw={800}>{t("visitStatus")}</Text>
          <SimpleGrid cols={2} spacing="sm">
            {arrivalStatuses.map((option) => {
              const StatusIcon = option.icon;
              return (
                <ChoiceButton
                  key={option.value}
                  selected={reservation.visitStatus === option.value}
                  disabled={
                    reservation.visitStatus === VisitStatus.Expected
                      ? option.value !== VisitStatus.Expected &&
                        (option.value !== VisitStatus.Arrived || !canCheckIn)
                      : option.value === VisitStatus.Expected ||
                        option.value === VisitStatus.Arrived
                  }
                  leftSection={<StatusIcon size={17} />}
                  onClick={() => {
                    if (option.value === VisitStatus.Arrived) {
                      checkInOwnerReservation(reservation);
                      return;
                    }

                    updateOwnerVisitStatus(reservation.id, option.value);
                  }}
                >
                  {t(`statuses.${option.value}`)}
                </ChoiceButton>
              );
            })}
          </SimpleGrid>
        </Stack>

        <Stack gap="sm">
          <Text fw={800}>{t("guestHistory")}</Text>
          <SimpleGrid cols={3} spacing={0}>
            {[
              [t("lastVisit"), reservation.lastVisit ?? "—"],
              [t("visits"), String(reservation.visits)],
              [t("points"), String(reservation.points)],
            ].map(([label, value]) => (
              <Card
                key={label}
                radius={0}
                p="md"
                style={{
                  background: uiColors.surface,
                  border: `1px solid ${uiColors.border}`,
                }}
              >
                <Stack gap={3} align="center">
                  <Text size="xs" c={uiColors.textSecondary}>
                    {label}
                  </Text>
                  <Text fw={800}>{value}</Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Stack>
    </OwnerShell>
  );
}
