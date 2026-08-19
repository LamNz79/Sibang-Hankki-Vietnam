import { describe, expect, it } from "vitest";
import { defaultLocale, isAppLocale } from "./config";

describe("locale configuration", () => {
  it("defaults to Vietnamese and rejects unsupported locales", () => {
    expect(defaultLocale).toBe("vi");
    expect(isAppLocale("vi")).toBe(true);
    expect(isAppLocale("en")).toBe(true);
    expect(isAppLocale("ko")).toBe(false);
  });
});
