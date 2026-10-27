"use client";

import { useQuery } from "@tanstack/react-query";
import { getOwnerRestaurantContext } from "@/features/owner/data/owner-restaurant-context";

export function useOwnerRestaurantContext() {
  const query = useQuery({
    queryKey: ["owner-restaurant-context"],
    queryFn: ({ signal }) => getOwnerRestaurantContext(signal),
    retry: false,
  });

  return { query };
}
