import { describe, expect, it } from "vitest";
import { cartTotals } from "./catalog";

describe("prototype cart totals", () => {
  it("does not charge delivery for an empty cart", () => {
    expect(cartTotals({})).toEqual({ subtotal: 0, delivery: 0, total: 0 });
  });
  it("includes quantities and delivery below the free delivery threshold", () => {
    expect(cartTotals({ coffee: 2 })).toEqual({ subtotal: 360000, delivery: 30000, total: 390000 });
  });
  it("offers free delivery at the threshold and ignores unknown products", () => {
    expect(cartTotals({ tea: 1, siumai: 1, unknown: 2 })).toEqual({ subtotal: 500000, delivery: 0, total: 500000 });
  });
});
