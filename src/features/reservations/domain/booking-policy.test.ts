import { describe, expect, it } from "vitest";
import { resolveBookingPolicy } from "./booking-policy";

describe("resolveBookingPolicy", () => {
  it("uses the restaurant booking policy when the API provides it", () => {
    const policy = {
      bookingWindowDays: 14,
      minimumPartySize: 3,
      maximumOnlinePartySize: 8,
      largePartyThreshold: 7,
    };

    expect(resolveBookingPolicy(policy)).toBe(policy);
  });

  it("keeps the current safe defaults while an older backend is deployed", () => {
    expect(resolveBookingPolicy()).toEqual({
      bookingWindowDays: 30,
      minimumPartySize: 2,
      maximumOnlinePartySize: 10,
      largePartyThreshold: 11,
    });
  });
});
