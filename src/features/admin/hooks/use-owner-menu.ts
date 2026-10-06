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

const queryKey = ["owner-menu"] as const;

export function useOwnerMenu() {
  const router = useRouter();
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey });
  const query = useQuery({ queryKey, queryFn: ({ signal }) => getOwnerMenu(signal), retry: false });
  const mutations = {
    createCategory: useMutation({ mutationFn: createCategory, onSuccess: refresh }),
    updateCategory: useMutation({ mutationFn: updateCategory, onSuccess: refresh }),
    deleteCategory: useMutation({ mutationFn: deleteCategory, onSuccess: refresh }),
    createItem: useMutation({ mutationFn: createItem, onSuccess: refresh }),
    updateItem: useMutation({ mutationFn: updateItem, onSuccess: refresh }),
    deleteItem: useMutation({ mutationFn: deleteItem, onSuccess: refresh }),
  };
  const error = query.error ?? Object.values(mutations).find((mutation) => mutation.error)?.error;

  useEffect(() => {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) router.replace("/login");
  }, [error, router]);

  return { query, mutations, error };
}
