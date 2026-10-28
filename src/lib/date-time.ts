export const restaurantTimeZone = "Asia/Ho_Chi_Minh";

/** Returns an ISO calendar day in the restaurant's timezone, never the browser's timezone. */
export function getRestaurantDateKey(
  value: Date = new Date(),
  timeZone = restaurantTimeZone,
) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** Returns a sortable local date-time key in the restaurant's timezone. */
export function getRestaurantDateTimeKey(
  value: Date = new Date(),
  timeZone = restaurantTimeZone,
) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

/** Parses a date-only API value at midnight in the restaurant timezone. */
export function toRestaurantDate(value: string) {
  return new Date(`${value}T00:00:00+07:00`);
}
