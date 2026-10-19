"use client";

import { useSyncExternalStore } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelCustomerReservation,
  getAccountReservations,
  getCustomerAccountReservation,
  getCustomerReservation,
  issueCustomerCheckInToken,
  requestAnotherTime,
  requestReservationChange,
  respondToAlternativeProposal,
  selectVisibleReservations,
} from "@/features/reservations/data/customer-reservations";
import type { CustomerReservation } from "@/features/reservations/types";
import { ReservationStatus, VisitStatus } from "@/features/reservations/types";
import {
  getReservationsServerSnapshot,
  getReservationsSnapshot,
  saveReservation,
  subscribeToReservations,
} from "@/features/reservations/data/reservation-storage";
import { findReservationById } from "@/features/reservations/domain/selectors";
import { ApiError } from "@/lib/api/client";

const RESERVATION_REFRESH_MS = 15_000;

function isTerminalReservation(reservation: CustomerReservation | undefined) {
  return Boolean(
    reservation &&
      (reservation.status === ReservationStatus.Declined ||
        reservation.status === ReservationStatus.Expired ||
        reservation.status === ReservationStatus.Cancelled ||
        reservation.visitStatus === VisitStatus.Completed ||
        reservation.visitStatus === VisitStatus.NoShow),
  );
}

function isUnauthorized(error: unknown) {
  return (
    error instanceof ApiError && (error.status === 401 || error.status === 403)
  );
}

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
      refetchInterval: (query: {
        state: { error: unknown; data?: CustomerReservation };
      }) =>
        isUnauthorized(query.state.error) ||
        isTerminalReservation(query.state.data ?? reservation)
          ? false
          : RESERVATION_REFRESH_MS,
    })),
  });
  const accountReservations = useQuery({
    queryKey: ["customer-account-reservations"],
    queryFn: ({ signal }) => getAccountReservations(signal),
    retry: false,
    refetchInterval: (query) =>
      isUnauthorized(query.state.error) ? false : RESERVATION_REFRESH_MS,
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
  const reservation = findReservationById(useCustomerReservations(), id);
  const detail = useQuery({
    queryKey: ["customer-account-reservations", id],
    queryFn: ({ signal }) => getCustomerAccountReservation(reservation!, signal),
    enabled: Boolean(reservation?.accountLinked),
    retry: false,
    refetchInterval: (query) =>
      isUnauthorized(query.state.error) ||
      isTerminalReservation(query.state.data ?? reservation)
        ? false
        : RESERVATION_REFRESH_MS,
  });
  return detail.data ?? reservation;
}

export function useRespondToAlternativeProposal(
  reservation: CustomerReservation | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action: "accept" | "decline") => {
      if (!reservation) throw new Error("Reservation is unavailable");
      return respondToAlternativeProposal(reservation, action);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(
        ["customer-reservations", updated.id],
        updated,
      );
      queryClient.setQueryData(
        ["customer-account-reservations", updated.id],
        updated,
      );
      queryClient.setQueryData<CustomerReservation[] | null>(
        ["customer-account-reservations"],
        (reservations) =>
          reservations?.map((item) =>
            item.id === updated.id ? updated : item,
          ) ?? reservations,
      );
    },
  });
}

export function useRequestAnotherTime(
  reservation: CustomerReservation | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ date, time }: { date: string; time: string }) => {
      if (!reservation) throw new Error("Reservation is unavailable");
      return requestAnotherTime(reservation, date, time);
    },
    onSuccess: (updated) => {
      if (updated.managementToken) saveReservation(updated);
      queryClient.setQueryData(["customer-reservations", updated.id], updated);
      queryClient.setQueryData(
        ["customer-account-reservations", updated.id],
        updated,
      );
      queryClient.setQueryData<CustomerReservation[] | null>(
        ["customer-account-reservations"],
        (reservations) =>
          reservations?.map((item) =>
            item.id === updated.id ? updated : item,
          ) ?? reservations,
      );
    },
  });
}

export function useRequestReservationChange(
  reservation: CustomerReservation | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      date,
      time,
      message,
    }: {
      date: string;
      time: string;
      message?: string;
    }) => {
      if (!reservation) throw new Error("Reservation is unavailable");
      return requestReservationChange(reservation, date, time, message);
    },
    onSuccess: (updated) => {
      if (updated.managementToken) saveReservation(updated);
      queryClient.setQueryData(["customer-reservations", updated.id], updated);
      queryClient.setQueryData(
        ["customer-account-reservations", updated.id],
        updated,
      );
      queryClient.setQueryData<CustomerReservation[] | null>(
        ["customer-account-reservations"],
        (reservations) =>
          reservations?.map((item) =>
            item.id === updated.id ? updated : item,
          ) ?? reservations,
      );
    },
  });
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

export function useCustomerCheckInToken(
  reservation: CustomerReservation | undefined,
) {
  return useQuery({
    queryKey: ["customer-check-in-token", reservation?.id],
    queryFn: () => issueCustomerCheckInToken(reservation!),
    enabled:
      reservation?.status === ReservationStatus.Confirmed &&
      (!reservation.visitStatus ||
        reservation.visitStatus === VisitStatus.Expected),
    retry: false,
    staleTime: Infinity,
  });
}
