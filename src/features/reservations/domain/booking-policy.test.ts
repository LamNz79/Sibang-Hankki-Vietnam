import { describe, expect, it } from "vitest";
import dayjs from "dayjs";
import {
  getBookingWindowEndDate,
  resolveBookingPolicy,
} from "./booking-policy";

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

describe("getBookingWindowEndDate", () => {
  it("counts the first day as part of the booking window", () => {
    expect(
      getBookingWindowEndDate(dayjs("2026-10-21"), 30).format("YYYY-MM-DD"),
    ).toBe("2026-11-19");
  });
});
