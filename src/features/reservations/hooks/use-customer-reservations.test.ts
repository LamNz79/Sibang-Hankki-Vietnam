import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/client";
import { getAccountReservationsRefreshInterval } from "./use-customer-reservations";

describe("customer reservation refresh interval", () => {
  it("stops polling after the API identifies an unauthenticated guest", () => {
    expect(getAccountReservationsRefreshInterval(null, null)).toBe(false);
  });

  it("stops polling after an authorization error", () => {
    expect(
      getAccountReservationsRefreshInterval(
        undefined,
        new ApiError(401, "Unauthorized"),
      ),
    ).toBe(false);
  });

  it("keeps polling while account data is available", () => {
    expect(getAccountReservationsRefreshInterval([], null)).toBe(15_000);
  });
});
