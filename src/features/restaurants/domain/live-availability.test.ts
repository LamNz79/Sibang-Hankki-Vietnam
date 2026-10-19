import { describe, expect, it } from "vitest";
import {
  getFirstLiveTime,
  getLiveAvailabilityState,
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

  it("presents the first live slot without embedding display language", () => {
    expect(getFirstLiveTime(availability)).toBe("11:30");
    expect(getLiveAvailabilityState(availability)).toEqual({
      kind: "available",
      time: "11:30",
      confirmationRequired: false,
    });
  });

  it("does not claim availability when no live slots exist", () => {
    expect(
      getLiveAvailabilityState({ ...availability, slots: [] }),
    ).toEqual({ kind: "unavailable", partySize: 2 });
  });
});
