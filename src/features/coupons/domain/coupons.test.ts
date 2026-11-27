import { describe, expect, it } from "vitest";
import { couponDiscountAmount, couponIneligibleReason, type Coupon } from "./coupons";

const restaurantCoupon: Coupon = {
  id: "r",
  kind: "restaurant",
  scope: "restaurant",
  status: "available",
  discount: { type: "amount", value: 100_000 },
  restaurantSlug: "anan-saigon",
  minSpend: 500_000,
  validUntil: "2026-11-30",
};

const shopCoupon: Coupon = {
  id: "s",
  kind: "shop",
  scope: "shop",
  status: "available",
  discount: { type: "percent", value: 10, max: 50_000 },
  validUntil: "2026-12-31",
};

describe("coupon eligibility", () => {
  const booking = { restaurantSlug: "anan-saigon", subtotal: 700_000 };

  it("accepts a matching restaurant coupon", () => {
    expect(couponIneligibleReason(restaurantCoupon, booking)).toBeNull();
  });

  it("rejects shop, other-restaurant, low-spend and used coupons", () => {
    expect(couponIneligibleReason(shopCoupon, booking)).toBe("shopOnly");
    expect(couponIneligibleReason(restaurantCoupon, { ...booking, restaurantSlug: "other" })).toBe("otherRestaurant");
    expect(couponIneligibleReason(restaurantCoupon, { ...booking, subtotal: 499_999 })).toBe("minSpend");
    expect(couponIneligibleReason({ ...restaurantCoupon, status: "used" }, booking)).toBe("notAvailable");
  });
});

describe("coupon discount", () => {
  it("applies fixed amounts without exceeding the subtotal", () => {
    expect(couponDiscountAmount(restaurantCoupon, 700_000)).toBe(100_000);
    expect(couponDiscountAmount(restaurantCoupon, 80_000)).toBe(80_000);
  });

  it("caps percent discounts at the maximum", () => {
    expect(couponDiscountAmount(shopCoupon, 300_000)).toBe(30_000);
    expect(couponDiscountAmount(shopCoupon, 900_000)).toBe(50_000);
  });

  it("gives no money discount for item coupons", () => {
    expect(couponDiscountAmount({ ...restaurantCoupon, discount: { type: "item" } }, 700_000)).toBe(0);
  });
});
