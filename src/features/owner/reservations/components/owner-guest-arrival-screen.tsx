"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Card, SimpleGrid, Stack, Text } from "@mantine/core";
import {
  IconCheck,
  IconCircleCheck,
  IconSofa,
  IconUserCheck,
} from "@tabler/icons-react";
import { ChoiceButton } from "@/components/ui";
import { getOwnerReservation } from "@/features/owner/data/mock-data";
import { OwnerShell } from "@/features/owner/shared";
import { VisitStatus } from "@/features/reservations/types";
import { uiColors } from "@/theme";
import { OwnerReservationSummaryCard } from "./owner-reservation-summary-card";
import { OwnerServiceNotesCard } from "./owner-service-notes-card";

const arrivalStatuses: Array<{
  value: VisitStatus;
  label: string;
  icon: typeof IconCheck;
}> = [
  { value: VisitStatus.Expected, label: "Confirmed", icon: IconCheck },
  { value: VisitStatus.Arrived, label: "Arrived", icon: IconUserCheck },
  { value: VisitStatus.Seated, label: "Seated", icon: IconSofa },
  { value: VisitStatus.Completed, label: "Completed", icon: IconCircleCheck },
];

export function OwnerGuestArrivalScreen() {
  const params = useParams<{ id: string }>();
  const reservation = getOwnerReservation(params.id);
  const initialStatus =
    reservation?.visitStatus === VisitStatus.Expected
      ? VisitStatus.Arrived
      : (reservation?.visitStatus ?? VisitStatus.Arrived);
  const [status, setStatus] = useState<VisitStatus>(initialStatus);

  if (!reservation) {
    return (
      <OwnerShell title="Guest arrival" backHref="/owner">
        <Card p="xl">
          <Text fw={700}>Reservation not found.</Text>
        </Card>
      </OwnerShell>
    );
  }

  return (
    <OwnerShell
      title="Guest arrival"
      eyebrow="Live visit management"
      backHref={`/owner/reservations/${reservation.id}`}
    >
      <Stack gap="md">
        <OwnerReservationSummaryCard
          reservation={reservation}
          status={
            status === VisitStatus.Expected
              ? reservation.reservationStatus
              : status
          }
        />

        <OwnerServiceNotesCard note={reservation.note} />

        <Stack gap="sm">
          <Text fw={800}>Visit status</Text>
          <SimpleGrid cols={2} spacing="sm">
            {arrivalStatuses.map((option) => {
              const StatusIcon = option.icon;
              return (
                <ChoiceButton
                  key={option.value}
                  selected={status === option.value}
                  leftSection={<StatusIcon size={17} />}
                  onClick={() => setStatus(option.value)}
                >
                  {option.label}
                </ChoiceButton>
              );
            })}
          </SimpleGrid>
        </Stack>

        <Stack gap="sm">
          <Text fw={800}>Guest history</Text>
          <SimpleGrid cols={3} spacing={0}>
            {[
              ["Last visit", reservation.lastVisit ?? "—"],
              ["Visits", String(reservation.visits)],
              ["Points", String(reservation.points)],
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
