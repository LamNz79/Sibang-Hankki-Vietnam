import type {
  OwnerReservation,
  OwnerReservationOverride,
} from "@/features/owner/types";

export type OwnerReservationOverridePatch = Omit<
  Partial<OwnerReservationOverride>,
  "id" | "updatedAt"
>;

/** Creates the next deterministic operational override for one reservation. */
export function createOwnerReservationOverride(
  id: string,
  patch: OwnerReservationOverridePatch,
  now: string,
  current?: OwnerReservationOverride,
): OwnerReservationOverride {
  return {
    ...current,
    ...patch,
    id,
    updatedAt: now,
  };
}

/** Applies persisted owner-only state to the base owner reservation records. */
export function applyOwnerReservationOverrides(
  reservations: OwnerReservation[],
  overrides: OwnerReservationOverride[],
) {
  return reservations.map((reservation) => {
    const override = overrides.find((item) => item.id === reservation.id);
    if (!override) return reservation;

    return {
      ...reservation,
      reservationStatus:
        override.reservationStatus ?? reservation.reservationStatus,
      visitStatus: override.visitStatus ?? reservation.visitStatus,
      requestResponse:
        override.requestResponse ?? reservation.requestResponse,
    };
  });
}
