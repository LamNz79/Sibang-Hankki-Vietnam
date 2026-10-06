"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOwnerSettings,
  updateOwnerSettings,
  type OwnerSettingsUpdate,
} from "@/features/owner/settings/data/owner-settings";
import { ApiError } from "@/lib/api/client";

const queryKey = ["owner-settings"] as const;

export function useOwnerSettings() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => getOwnerSettings(signal),
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: (settings: OwnerSettingsUpdate) => updateOwnerSettings(settings),
    onSuccess: (settings) => queryClient.setQueryData(queryKey, settings),
  });

  useEffect(() => {
    const error = query.error ?? mutation.error;
    if (error instanceof ApiError && error.status === 401) {
      router.replace("/login");
    }
  }, [mutation.error, query.error, router]);

  return { query, mutation };
}
