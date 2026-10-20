"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCustomerFavorites,
  removeCustomerFavorite,
  saveCustomerFavorite,
} from "@/features/restaurants/data/customer-favorites";
import { ApiError } from "@/lib/api/client";

const QUERY_KEY = ["customer-favorites"] as const;

export function useSavedRestaurants() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: ({ signal }) => getCustomerFavorites(signal),
    retry: false,
  });
  const slugs = new Set(query.data?.map(({ slug }) => slug) ?? []);
  const mutation = useMutation({
    mutationFn: async (slug: string) => {
      const wasSaved = slugs.has(slug);
      await (wasSaved
        ? removeCustomerFavorite(slug)
        : saveCustomerFavorite(slug));
      return !wasSaved;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
  const requiresLogin =
    query.error instanceof ApiError &&
    (query.error.status === 401 || query.error.status === 403);

  return {
    restaurants: query.data ?? [],
    slugs: [...slugs],
    isSaved: (slug: string) => slugs.has(slug),
    toggle: mutation.mutateAsync,
    isToggling: mutation.isPending,
    isLoading: query.isPending,
    isError: query.isError && !requiresLogin,
    requiresLogin,
    retry: query.refetch,
  };
}
