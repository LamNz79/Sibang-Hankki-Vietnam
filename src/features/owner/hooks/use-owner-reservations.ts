"use client";

import { useMemo, useSyncExternalStore } from "react";
import { ownerReservations as baseOwnerReservations } from "@/features/owner/data/mock-data";
import { mergeOwnerReservationsWithCustomerState } from "@/features/owner/data/owner-reservation-adapter";
import {
  getReservationsServerSnapshot,
  getReservationsSnapshot,
  subscribeToReservations,
} from "@/features/reservations/data/reservation-storage";

export function useOwnerReservations() {
  const customerReservations = useSyncExternalStore(
    subscribeToReservations,
    getReservationsSnapshot,
    getReservationsServerSnapshot,
  );

  return useMemo(
    () =>
      mergeOwnerReservationsWithCustomerState(
        baseOwnerReservations,
        customerReservations,
      ),
    [customerReservations],
  );
}

export function useOwnerReservation(id: string) {
  const reservations = useOwnerReservations();
  return reservations.find((reservation) => reservation.id === id);
}
