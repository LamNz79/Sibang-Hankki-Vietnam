import type { RestaurantBookingPolicy } from "@/features/restaurants/data/types";
import type { Dayjs } from "dayjs";

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

export function getBookingWindowEndDate(
  startDate: Dayjs,
  bookingWindowDays: number,
): Dayjs {
  return startDate.add(bookingWindowDays - 1, "day");
}
