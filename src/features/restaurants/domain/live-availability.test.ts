import { describe, expect, it } from "vitest";
import {
  getFirstLiveTime,
  getLiveAvailabilityLabel,
  getRestaurantLocalDate,
} from "@/features/restaurants/domain/live-availability";

const availability = {
  restaurantSlug: "royal-pavilion",
  date: "2026-10-19",
  partySize: 2,
  slots: ["11:30", "12:30"],
  requiresRestaurantConfirmation: false,
};

describe("live restaurant availability", () => {
  it("uses the Vietnam restaurant date independently of server timezone", () => {
    expect(getRestaurantLocalDate(new Date("2026-10-18T18:00:00.000Z"))).toBe(
      "2026-10-19",
    );
  });

  it("presents the first live slot", () => {
    expect(getFirstLiveTime(availability)).toBe("11:30");
    expect(getLiveAvailabilityLabel(availability)).toBe(
      "Available today from 11:30",
    );
  });

  it("does not claim availability when no live slots exist", () => {
    expect(
      getLiveAvailabilityLabel({ ...availability, slots: [] }),
    ).toBe("No online times for 2 guests today");
  });
});
