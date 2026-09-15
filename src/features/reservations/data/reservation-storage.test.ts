import { afterEach, describe, expect, it, vi } from "vitest";
import { createCheckInToken } from "@/features/reservations/data/reservation-storage";

describe("createCheckInToken", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("uses secure random bytes when randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", {
      getRandomValues: (bytes: Uint8Array) => bytes.fill(15),
    });

    expect(createCheckInToken()).toBe("0f".repeat(16));
  });
});
