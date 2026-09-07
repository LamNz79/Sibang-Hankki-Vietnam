"use client";

import Link from "next/link";
import { Button, SimpleGrid } from "@mantine/core";
import { useTranslations } from "next-intl";
import { getReservationStatusFlags } from "@/features/reservations/domain/selectors";
import type { CustomerReservation } from "@/features/reservations/types";

type ReservationDetailActionsProps = {
  reservation: CustomerReservation;
};

/** Shows the actions available for the current customer reservation status. */
export function ReservationDetailActions({
  reservation,
}: ReservationDetailActionsProps) {
  const t = useTranslations("CustomerReservationDetails.actions");
  const { isPending, isAlternative, isDeclined } =
    getReservationStatusFlags(reservation);

  if (isAlternative) return null;

  if (isDeclined) {
    return (
      <Button
        component={Link}
        href={`/reservation?restaurant=${reservation.restaurantSlug}`}
        fullWidth
        color="warmCoral"
      >
        {t("newReservation")}
      </Button>
    );
  }

  return (
    <SimpleGrid cols={2} spacing="sm">
      <Button
        variant="outline"
        color="gray"
        radius="md"
        disabled
        title={t("changeHint")}
      >
        {isPending ? t("changeRequest") : t("change")}
      </Button>
      <Button
        variant="outline"
        color="red"
        radius="md"
        disabled
        title={t("cancelHint")}
      >
        {isPending ? t("cancelRequest") : t("cancel")}
      </Button>
    </SimpleGrid>
  );
}
