"use client";

import { useSyncExternalStore } from "react";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import {
  cancelCustomerReservation,
  getCustomerReservation,
} from "@/features/reservations/data/customer-reservations";
import type { CustomerReservation } from "@/features/reservations/types";
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
  const storedReservations = useSyncExternalStore(
    subscribeToReservations,
    getReservationsSnapshot,
    getReservationsServerSnapshot,
  );
  const remoteReservations = useQueries({
    queries: storedReservations.map((reservation) => ({
      queryKey: ["customer-reservations", reservation.id],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getCustomerReservation(reservation, signal),
      enabled: Boolean(reservation.managementToken),
      retry: false,
    })),
  });

  return storedReservations.map(
    (reservation, index) => remoteReservations[index]?.data ?? reservation,
  );
}

/** Returns the customer reservation matching `id`, if one exists. */
export function useCustomerReservation(id: string) {
  return findReservationById(useCustomerReservations(), id);
}

export function useCancelCustomerReservation(
  reservation: CustomerReservation | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!reservation) throw new Error("Reservation is unavailable");
      return cancelCustomerReservation(reservation);
    },
    onSuccess: (cancelled) => {
      queryClient.setQueryData(
        ["customer-reservations", cancelled.id],
        cancelled,
      );
    },
  });
}
