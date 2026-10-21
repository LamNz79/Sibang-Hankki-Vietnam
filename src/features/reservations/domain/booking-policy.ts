import type { RestaurantBookingPolicy } from "@/features/restaurants/data/types";

const defaultBookingPolicy: RestaurantBookingPolicy = {
  bookingWindowDays: 30,
  minimumPartySize: 2,
  maximumOnlinePartySize: 10,
  largePartyThreshold: 11,
};

export function resolveBookingPolicy(
  policy?: RestaurantBookingPolicy,
): RestaurantBookingPolicy {
  return policy ?? defaultBookingPolicy;
}
