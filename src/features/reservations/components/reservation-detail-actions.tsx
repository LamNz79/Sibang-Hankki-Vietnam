import Link from "next/link";
import { Button, SimpleGrid } from "@mantine/core";
import { getReservationStatusFlags } from "@/features/reservations/domain/selectors";
import type { CustomerReservation } from "@/features/reservations/types";

type ReservationDetailActionsProps = {
  reservation: CustomerReservation;
};

/** Shows the actions available for the current customer reservation status. */
export function ReservationDetailActions({
  reservation,
}: ReservationDetailActionsProps) {
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
        Make a new reservation
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
        title="Change flow will be added after the policy is confirmed"
      >
        {isPending ? "Change request" : "Change"}
      </Button>
      <Button
        variant="outline"
        color="red"
        radius="md"
        disabled
        title="Cancellation flow will be added after the policy is confirmed"
      >
        {isPending ? "Cancel request" : "Cancel"}
      </Button>
    </SimpleGrid>
  );
}
