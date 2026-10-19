"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelOwnerReservation,
  checkInOwnerReservation,
  completeOwnerReservation,
  confirmOwnerReservation,
  createOwnerWalkIn,
  declineOwnerReservation,
  getOwnerReservation,
  getOwnerReservationPage,
  getOwnerReservations,
  markNoShowOwnerReservation,
  manuallyCheckInOwnerReservation,
  proposeAlternativeOwnerReservation,
  respondToOwnerReservationChangeRequest,
  seatOwnerReservation,
  type OwnerAlternativeProposalInput,
  type OwnerReservationPageParams,
} from "@/features/owner/data/owner-reservations";
import { ApiError } from "@/lib/api/client";

const RESERVATION_REFRESH_MS = 15_000;

function reservationRefreshInterval(error: unknown) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403)
    ? false
    : RESERVATION_REFRESH_MS;
}

function useLoginRedirect(error: Error | null) {
  const router = useRouter();
  useEffect(() => {
    if (error instanceof ApiError && error.status === 401) {
      router.replace("/login");
    }
  }, [error, router]);
}

export function useOwnerCheckIn() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: checkInOwnerReservation,
    onSuccess: async (reservation) => {
      queryClient.setQueryData(
        ["owner-reservations", reservation.id],
        reservation,
      );
      await queryClient.invalidateQueries({ queryKey: ["owner-reservations"] });
    },
  });
  useLoginRedirect(mutation.error);
  return mutation;
}

export function useOwnerReservations() {
  const query = useQuery({
    queryKey: ["owner-reservations"],
    queryFn: ({ signal }) => getOwnerReservations(signal),
    retry: false,
    refetchInterval: (query) => reservationRefreshInterval(query.state.error),
  });
  useLoginRedirect(query.error);
  return { ...query, reservations: query.data ?? [] };
}

export function useOwnerWalkIn() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createOwnerWalkIn,
    onSuccess: async (reservation) => {
      queryClient.setQueryData(
        ["owner-reservations", reservation.id],
        reservation,
      );
      await queryClient.invalidateQueries({ queryKey: ["owner-reservations"] });
    },
  });
  useLoginRedirect(mutation.error);
  return mutation;
}

export function useOwnerReservationPage(params: OwnerReservationPageParams) {
  const query = useQuery({
    queryKey: ["owner-reservations", "paged", params],
    queryFn: ({ signal }) => getOwnerReservationPage(params, signal),
    placeholderData: (previousData) => previousData,
    retry: false,
    refetchInterval: (query) => reservationRefreshInterval(query.state.error),
  });
  useLoginRedirect(query.error);
  return query;
}

export function useOwnerReservation(id: string) {
  const query = useQuery({
    queryKey: ["owner-reservations", id],
    queryFn: ({ signal }) => getOwnerReservation(id, signal),
    enabled: Boolean(id),
    retry: false,
    refetchInterval: (query) => reservationRefreshInterval(query.state.error),
  });
  useLoginRedirect(query.error);
  return { ...query, reservation: query.data };
}

export function useOwnerReservationActions(id: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (
      action:
        | { kind: "confirm" }
        | { kind: "decline"; reason: string }
        | { kind: "cancel"; reason: string }
        | { kind: "no-show" }
        | { kind: "propose"; proposal: OwnerAlternativeProposalInput }
        | { kind: "accept-change"; requestId: string }
        | { kind: "decline-change"; requestId: string }
        | { kind: "seat" }
        | { kind: "complete" },
    ) => {
      if (action.kind === "confirm") return confirmOwnerReservation(id);
      if (action.kind === "decline") {
        return declineOwnerReservation(id, action.reason);
      }
      if (action.kind === "cancel") {
        return cancelOwnerReservation(id, action.reason);
      }
      if (action.kind === "no-show") return markNoShowOwnerReservation(id);
      if (action.kind === "propose") {
        return proposeAlternativeOwnerReservation(id, action.proposal);
      }
      if (action.kind === "accept-change" || action.kind === "decline-change") {
        return respondToOwnerReservationChangeRequest(
          id,
          action.requestId,
          action.kind === "accept-change" ? "accept" : "decline",
        );
      }
      return action.kind === "seat"
        ? seatOwnerReservation(id)
        : completeOwnerReservation(id);
    },
    onSuccess: async (reservation) => {
      queryClient.setQueryData(["owner-reservations", id], reservation);
      await queryClient.invalidateQueries({ queryKey: ["owner-reservations"] });
    },
  });
  useLoginRedirect(mutation.error);

  return {
    ...mutation,
    confirm: () => mutation.mutate({ kind: "confirm" }),
    decline: (reason: string) => mutation.mutateAsync({ kind: "decline", reason }),
    cancel: (reason: string) => mutation.mutateAsync({ kind: "cancel", reason }),
    markNoShow: () => mutation.mutateAsync({ kind: "no-show" }),
    propose: (proposal: OwnerAlternativeProposalInput) =>
      mutation.mutateAsync({ kind: "propose", proposal }),
    acceptChange: (requestId: string) =>
      mutation.mutateAsync({ kind: "accept-change", requestId }),
    declineChange: (requestId: string) =>
      mutation.mutateAsync({ kind: "decline-change", requestId }),
    seat: () => mutation.mutate({ kind: "seat" }),
    complete: () => mutation.mutate({ kind: "complete" }),
  };
}

export function useOwnerManualCheckIn() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: manuallyCheckInOwnerReservation,
    onSuccess: async (reservation) => {
      queryClient.setQueryData(
        ["owner-reservations", reservation.id],
        reservation,
      );
      await queryClient.invalidateQueries({ queryKey: ["owner-reservations"] });
    },
  });
  useLoginRedirect(mutation.error);
  return mutation;
}
