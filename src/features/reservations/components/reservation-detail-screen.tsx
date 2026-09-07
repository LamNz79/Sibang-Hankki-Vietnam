"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, Card, Stack, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { BottomNav, MobileShell } from "@/components/layout/customer";
import {
  getReservationReference,
  getReservationStatusFlags,
} from "@/features/reservations/domain/selectors";
import { useCustomerReservation } from "@/features/reservations/hooks/use-customer-reservations";
import { getRestaurantBySlug } from "@/features/restaurants/data/mock-data";
import { uiColors } from "@/theme";
import { CustomerAlternativeProposalCard } from "./customer-alternative-proposal-card";
import { ReservationCheckInCard } from "./reservation-check-in-card";
import { ReservationDetailActions } from "./reservation-detail-actions";
import { ReservationInformationCard } from "./reservation-information-card";
import { ReservationReferenceCard } from "./reservation-reference-card";
import { ReservationRestaurantCard } from "./reservation-restaurant-card";
import { ReservationStatusSummary } from "./reservation-status-summary";

/** Customer reservation detail screen that orchestrates feature-level sections. */
export function ReservationDetailScreen() {
  const t = useTranslations("CustomerReservationDetails");
  const params = useParams<{ id: string }>();
  const reservation = useCustomerReservation(params.id);

  if (!reservation) {
    return (
      <MobileShell
        title={t("title")}
        backHref="/reservations"
        bottomNav={<BottomNav activePath="/reservations" />}
      >
        <Card
          radius="lg"
          p="xl"
          style={{
            border: `1px dashed ${uiColors.borderStrong}`,
            background: uiColors.surfaceAlt,
          }}
        >
          <Stack align="center" gap="sm">
            <Text fw={800} c={uiColors.textPrimary}>
              {t("notFound.title")}
            </Text>
            <Text size="sm" ta="center" c={uiColors.textSecondary}>
              {t("notFound.description")}
            </Text>
            <Button component={Link} href="/reservations" color="warmCoral">
              {t("notFound.back")}
            </Button>
          </Stack>
        </Card>
      </MobileShell>
    );
  }

  const restaurant = getRestaurantBySlug(reservation.restaurantSlug);
  const reference = getReservationReference(reservation);
  const { isAlternative } = getReservationStatusFlags(reservation);

  return (
    <MobileShell
      title={t("title")}
      backHref="/reservations"
      bottomNav={<BottomNav activePath="/reservations" />}
    >
      <ReservationStatusSummary reservation={reservation} />
      {isAlternative ? (
        <CustomerAlternativeProposalCard reservation={reservation} />
      ) : null}
      <ReservationReferenceCard reference={reference} />
      <ReservationRestaurantCard
        reservation={reservation}
        heroAccent={restaurant?.heroAccent}
      />
      <ReservationInformationCard reservation={reservation} />
      <ReservationCheckInCard reservation={reservation} />
      <ReservationDetailActions reservation={reservation} />
    </MobileShell>
  );
}
