import { describe, expect, it } from "vitest";
import { getGuestCapacity } from "@/features/reservations/hooks/use-reservation-booking";

describe("reservation booking", () => {
  it("maps exact guest counts to prototype capacity buckets", () => {
    expect([1, 2, 3, 4, 5, 11].map(getGuestCapacity)).toEqual([
      "2",
      "2",
      "4",
      "4",
      "6",
      "6",
    ]);
  });
});
