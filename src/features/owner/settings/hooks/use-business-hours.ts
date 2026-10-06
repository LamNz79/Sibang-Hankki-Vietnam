"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBusinessHours,
  regenerateSlots,
  updateBusinessHours,
  type BusinessHour,
} from "@/features/owner/settings/data/business-hours";
import { ApiError } from "@/lib/api/client";

const queryKey = ["owner-business-hours"] as const;

export function useBusinessHours() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => getBusinessHours(signal),
    retry: false,
  });
  const updateMutation = useMutation({
    mutationFn: (hours: BusinessHour[]) => updateBusinessHours(hours),
    onSuccess: (result) => queryClient.setQueryData(queryKey, result.hours),
  });
  const regenerateMutation = useMutation({ mutationFn: regenerateSlots });

  useEffect(() => {
    const error = query.error ?? updateMutation.error ?? regenerateMutation.error;
    if (error instanceof ApiError && error.status === 401) router.replace("/login");
  }, [query.error, regenerateMutation.error, router, updateMutation.error]);

  return { query, updateMutation, regenerateMutation };
}
