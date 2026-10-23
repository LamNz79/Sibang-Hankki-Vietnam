export const restaurantTimeZone = "Asia/Ho_Chi_Minh";

/** Parses a date-only API value at midnight in the restaurant timezone. */
export function toRestaurantDate(value: string) {
  return new Date(`${value}T00:00:00+07:00`);
}
