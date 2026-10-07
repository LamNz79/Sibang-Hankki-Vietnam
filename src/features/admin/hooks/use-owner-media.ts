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

const queryKey = ["owner-media"] as const;

export function useOwnerMedia() {
  const router = useRouter();
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey });
  const query = useQuery({ queryKey, queryFn: ({ signal }) => getOwnerMedia(signal), retry: false });
  const mutations = {
    create: useMutation({ mutationFn: createRestaurantImage, onSuccess: refresh }),
    update: useMutation({ mutationFn: updateRestaurantImage, onSuccess: refresh }),
    delete: useMutation({ mutationFn: deleteRestaurantImage, onSuccess: refresh }),
  };
  const error = query.error ?? Object.values(mutations).find((mutation) => mutation.error)?.error;

  useEffect(() => {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) router.replace("/login");
  }, [error, router]);

  return { query, mutations, error };
}
