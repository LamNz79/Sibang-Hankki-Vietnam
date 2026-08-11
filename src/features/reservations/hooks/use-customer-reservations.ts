"use client";

import { useSyncExternalStore } from "react";
import {
  getReservationsServerSnapshot,
  getReservationsSnapshot,
  subscribeToReservations,
} from "@/features/reservations/data/reservation-storage";
import { findReservationById } from "@/features/reservations/domain/selectors";

/**
 * Subscribes React components to the current customer reservation collection.
 * This hook is the UI boundary that can later switch from local storage to API data.
 */
export function useCustomerReservations() {
  return useSyncExternalStore(
    subscribeToReservations,
    getReservationsSnapshot,
    getReservationsServerSnapshot,
  );
}

/** Returns the customer reservation matching `id`, if one exists. */
export function useCustomerReservation(id: string) {
  return findReservationById(useCustomerReservations(), id);
}
