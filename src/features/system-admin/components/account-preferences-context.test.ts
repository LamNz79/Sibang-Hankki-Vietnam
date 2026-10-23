import { describe, expect, it } from "vitest";
import {
  accountAccentPalette,
  formatPreferenceDate,
} from "./account-preferences-context";

describe("account preference display helpers", () => {
  it("uses the selected date order", () => {
    const date = new Date("2026-10-22T00:00:00Z");
    expect(formatPreferenceDate(date, { dateFormat: "DD_MM_YYYY", locale: "vi" }))
      .toBe("22/10/2026");
    expect(formatPreferenceDate(date, { dateFormat: "MM_DD_YYYY", locale: "en" }))
      .toBe("10/22/2026");
  });

  it("keeps the selected HEX as the primary shade and falls back for invalid data", () => {
    expect(accountAccentPalette("#2563eb")[7]).toBe("#2563EB");
    expect(accountAccentPalette("not-a-color")[7]).toBe("#B84A2F");
  });
});
