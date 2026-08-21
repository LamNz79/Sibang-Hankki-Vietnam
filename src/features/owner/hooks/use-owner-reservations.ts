"use client";

import { useMemo, useSyncExternalStore } from "react";
import { ownerReservations as baseOwnerReservations } from "@/features/owner/data/mock-data";
import { mergeOwnerReservationsWithCustomerState } from "@/features/owner/data/owner-reservation-adapter";
import {
  getOwnerReservationOverridesServerSnapshot,
  getOwnerReservationOverridesSnapshot,
  subscribeToOwnerReservationOverrides,
} from "@/features/owner/data/owner-reservation-storage";
import { applyOwnerReservationOverrides } from "@/features/owner/domain/owner-reservation-operations";
import { useCustomerReservations } from "@/features/reservations/hooks/use-customer-reservations";

/**
 * Combines the owner prototype records with the latest customer-side state.
 * This remains the owner UI's data boundary until a backend API is introduced.
 */
export function useOwnerReservations() {
  const customerReservations = useCustomerReservations();
  const ownerOverrides = useSyncExternalStore(
    subscribeToOwnerReservationOverrides,
    getOwnerReservationOverridesSnapshot,
    getOwnerReservationOverridesServerSnapshot,
  );

  return useMemo(
    () => {
      const reservationsWithCustomerState = mergeOwnerReservationsWithCustomerState(
        baseOwnerReservations,
        customerReservations.filter(
          (reservation) => reservation.restaurantSlug === "royal-pavilion",
        ),
      );

      return applyOwnerReservationOverrides(
        reservationsWithCustomerState,
        ownerOverrides,
      );
    },
    [customerReservations, ownerOverrides],
  );
}

/** Returns one merged owner reservation by id. */
export function useOwnerReservation(id: string) {
  const reservations = useOwnerReservations();
  return reservations.find((reservation) => reservation.id === id);
}
