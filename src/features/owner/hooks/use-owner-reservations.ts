"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  checkInOwnerReservation,
  completeOwnerReservation,
  confirmOwnerReservation,
  declineOwnerReservation,
  getOwnerReservation,
  getOwnerReservations,
  seatOwnerReservation,
} from "@/features/owner/data/owner-reservations";
import { ApiError } from "@/lib/api/client";

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
  });
  useLoginRedirect(query.error);
  return { ...query, reservations: query.data ?? [] };
}

export function useOwnerReservation(id: string) {
  const query = useQuery({
    queryKey: ["owner-reservations", id],
    queryFn: ({ signal }) => getOwnerReservation(id, signal),
    enabled: Boolean(id),
    retry: false,
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
        | { kind: "seat" }
        | { kind: "complete" },
    ) => {
      if (action.kind === "confirm") return confirmOwnerReservation(id);
      if (action.kind === "decline") {
        return declineOwnerReservation(id, action.reason);
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
    seat: () => mutation.mutate({ kind: "seat" }),
    complete: () => mutation.mutate({ kind: "complete" }),
  };
}
