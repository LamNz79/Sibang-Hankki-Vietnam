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

export function getLiveAvailabilityLabel(
  availability: RestaurantAvailability | null | undefined,
) {
  if (!availability) return "Check times in the booking step";
  if (availability.slots.length === 0) {
    return availability.requiresRestaurantConfirmation
      ? "Contact the restaurant for this party size"
      : `No online times for ${availability.partySize} guests today`;
  }

  const confirmation = availability.requiresRestaurantConfirmation
    ? " · confirmation required"
    : "";
  return `Available today from ${availability.slots[0]}${confirmation}`;
}

export function getFirstLiveTime(
  availability: RestaurantAvailability | null | undefined,
) {
  return availability?.slots[0] ?? null;
}
