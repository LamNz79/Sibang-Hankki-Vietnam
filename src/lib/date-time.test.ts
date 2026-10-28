import { describe, expect, it } from "vitest";
import {
  getRestaurantDateKey,
  getRestaurantDateTimeKey,
  restaurantTimeZone,
  toRestaurantDate,
} from "./date-time";

describe("restaurant date and time", () => {
  it("keeps a date-only value on the selected Vietnam calendar day", () => {
    expect(
      new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: restaurantTimeZone,
      }).format(toRestaurantDate("2026-10-25")),
    ).toBe("2026-10-25");
  });

  it("displays UTC reservation timestamps in Vietnam time", () => {
    expect(
      new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: restaurantTimeZone,
      }).format(new Date("2026-10-25T13:30:00Z")),
    ).toBe("20:30");
  });

  it("derives the business day and time from Vietnam instead of the device timezone", () => {
    const instant = new Date("2026-10-25T17:30:00.000Z");
    expect(getRestaurantDateKey(instant)).toBe("2026-10-26");
    expect(getRestaurantDateTimeKey(instant)).toBe("2026-10-26T00:30");
  });
});
