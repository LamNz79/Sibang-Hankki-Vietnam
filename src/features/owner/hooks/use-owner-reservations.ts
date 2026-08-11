"use client";

import { useMemo } from "react";
import { ownerReservations as baseOwnerReservations } from "@/features/owner/data/mock-data";
import { mergeOwnerReservationsWithCustomerState } from "@/features/owner/data/owner-reservation-adapter";
import { useCustomerReservations } from "@/features/reservations/hooks/use-customer-reservations";

/**
 * Combines the owner prototype records with the latest customer-side state.
 * This remains the owner UI's data boundary until a backend API is introduced.
 */
export function useOwnerReservations() {
  const customerReservations = useCustomerReservations();

  return useMemo(
    () =>
      mergeOwnerReservationsWithCustomerState(
        baseOwnerReservations,
        customerReservations,
      ),
    [customerReservations],
  );
}

/** Returns one merged owner reservation by id. */
export function useOwnerReservation(id: string) {
  const reservations = useOwnerReservations();
  return reservations.find((reservation) => reservation.id === id);
}
