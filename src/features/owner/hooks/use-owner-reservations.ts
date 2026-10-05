"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  getOwnerReservation,
  getOwnerReservations,
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
