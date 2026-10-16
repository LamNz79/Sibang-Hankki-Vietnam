"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  createItem,
  deleteCategory,
  deleteItem,
  getOwnerMenu,
  updateCategory,
  updateItem,
} from "@/features/admin/data/owner-menu";
import { ApiError } from "@/lib/api/client";

export function useOwnerMenu(restaurantId?: string) {
  const router = useRouter();
  const client = useQueryClient();
  const queryKey = restaurantId
    ? ["system-admin-restaurant-menu", restaurantId] as const
    : ["owner-menu"] as const;
  const refresh = () => client.invalidateQueries({ queryKey });
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => getOwnerMenu(signal, restaurantId),
    retry: false,
  });
  const mutations = {
    createCategory: useMutation({ mutationFn: (input: Parameters<typeof createCategory>[0]) => createCategory(input, restaurantId), onSuccess: refresh }),
    updateCategory: useMutation({ mutationFn: (input: Parameters<typeof updateCategory>[0]) => updateCategory(input, restaurantId), onSuccess: refresh }),
    deleteCategory: useMutation({ mutationFn: (id: string) => deleteCategory(id, restaurantId), onSuccess: refresh }),
    createItem: useMutation({ mutationFn: (input: Parameters<typeof createItem>[0]) => createItem(input, restaurantId), onSuccess: refresh }),
    updateItem: useMutation({ mutationFn: (input: Parameters<typeof updateItem>[0]) => updateItem(input, restaurantId), onSuccess: refresh }),
    deleteItem: useMutation({ mutationFn: (id: string) => deleteItem(id, restaurantId), onSuccess: refresh }),
  };
  const error = query.error ?? Object.values(mutations).find((mutation) => mutation.error)?.error;

  useEffect(() => {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) router.replace("/login");
  }, [error, router]);

  return { query, mutations, error };
}
