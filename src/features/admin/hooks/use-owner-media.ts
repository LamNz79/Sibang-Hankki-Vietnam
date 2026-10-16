"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRestaurantImage,
  deleteRestaurantImage,
  getOwnerMedia,
  updateRestaurantImage,
} from "@/features/admin/data/owner-media";
import { ApiError } from "@/lib/api/client";

export function useOwnerMedia(restaurantId?: string) {
  const router = useRouter();
  const client = useQueryClient();
  const queryKey = restaurantId
    ? ["system-admin-restaurant-media", restaurantId] as const
    : ["owner-media"] as const;
  const refresh = () => client.invalidateQueries({ queryKey });
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => getOwnerMedia(signal, restaurantId),
    retry: false,
  });
  const mutations = {
    create: useMutation({ mutationFn: (input: Parameters<typeof createRestaurantImage>[0]) => createRestaurantImage(input, restaurantId), onSuccess: refresh }),
    update: useMutation({ mutationFn: (input: Parameters<typeof updateRestaurantImage>[0]) => updateRestaurantImage(input, restaurantId), onSuccess: refresh }),
    delete: useMutation({ mutationFn: (id: string) => deleteRestaurantImage(id, restaurantId), onSuccess: refresh }),
  };
  const error = query.error ?? Object.values(mutations).find((mutation) => mutation.error)?.error;

  useEffect(() => {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) router.replace("/login");
  }, [error, router]);

  return { query, mutations, error };
}
