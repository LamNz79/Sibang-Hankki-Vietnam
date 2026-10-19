import type { RestaurantAvailability } from "@/features/reservations/data/availability";

export type RestaurantAvailabilityMap = Record<
  string,
  RestaurantAvailability | null
>;

export function getRestaurantLocalDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export type LiveAvailabilityState =
  | { kind: "unknown" }
  | { kind: "contact" }
  | { kind: "unavailable"; partySize: number }
  | { kind: "available"; time: string; confirmationRequired: boolean };

export function getLiveAvailabilityState(
  availability: RestaurantAvailability | null | undefined,
): LiveAvailabilityState {
  if (!availability) return { kind: "unknown" };
  if (availability.slots.length === 0) {
    return availability.requiresRestaurantConfirmation
      ? { kind: "contact" }
      : { kind: "unavailable", partySize: availability.partySize };
  }
  return {
    kind: "available",
    time: availability.slots[0],
    confirmationRequired: availability.requiresRestaurantConfirmation,
  };
}

export function getFirstLiveTime(
  availability: RestaurantAvailability | null | undefined,
) {
  return availability?.slots[0] ?? null;
}
