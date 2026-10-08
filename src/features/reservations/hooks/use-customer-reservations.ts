"use client";

import { useSyncExternalStore } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelCustomerReservation,
  getAccountReservations,
  getCustomerReservation,
  selectVisibleReservations,
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
export function useCustomerReservationsState() {
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
  const accountReservations = useQuery({
    queryKey: ["customer-account-reservations"],
    queryFn: ({ signal }) => getAccountReservations(signal),
    retry: false,
  });
  const refreshedStored = storedReservations.map(
    (reservation, index) => remoteReservations[index]?.data ?? reservation,
  );

  return {
    reservations: selectVisibleReservations(
      refreshedStored,
      accountReservations.data,
    ),
    isLoading: accountReservations.isPending,
    isError: accountReservations.isError,
    retry: accountReservations.refetch,
  };
}

export function useCustomerReservations() {
  return useCustomerReservationsState().reservations;
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
      queryClient.setQueryData<CustomerReservation[] | null>(
        ["customer-account-reservations"],
        (reservations) =>
          reservations?.map((reservation) =>
            reservation.id === cancelled.id ? cancelled : reservation,
          ) ?? reservations,
      );
    },
  });
}
