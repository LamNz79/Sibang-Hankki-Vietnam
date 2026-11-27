export type CouponStatus = "available" | "used" | "expired";
export type CouponKind = "restaurant" | "birthday" | "shop";

export type CouponDiscount =
  | { type: "amount"; value: number }
  | { type: "percent"; value: number; max?: number }
  | { type: "item" };

export type Coupon = {
  id: string;
  kind: CouponKind;
  /** Where it can be redeemed: restaurant bookings or Shop orders. */
  scope: "restaurant" | "shop";
  status: CouponStatus;
  discount: CouponDiscount;
  /** Restaurant-scoped coupons limited to one restaurant; undefined = any participating restaurant. */
  restaurantSlug?: string;
  restaurantName?: string;
  minSpend?: number;
  validFrom?: string;
  validUntil: string;
};

export type CouponBooking = {
  restaurantSlug: string;
  subtotal: number;
};

export type CouponIneligibleReason = "notAvailable" | "shopOnly" | "otherRestaurant" | "minSpend";

export function couponIneligibleReason(coupon: Coupon, booking: CouponBooking): CouponIneligibleReason | null {
  if (coupon.status !== "available") return "notAvailable";
  if (coupon.scope === "shop") return "shopOnly";
  if (coupon.restaurantSlug && coupon.restaurantSlug !== booking.restaurantSlug) return "otherRestaurant";
  if (coupon.minSpend && booking.subtotal < coupon.minSpend) return "minSpend";
  return null;
}

/** Money discount in VND; never more than the subtotal. Item coupons (e.g. a dessert) discount 0 VND. */
export function couponDiscountAmount(coupon: Coupon, subtotal: number): number {
  const { discount } = coupon;
  if (discount.type === "item") return 0;
  const raw = discount.type === "amount" ? discount.value : Math.round((subtotal * discount.value) / 100);
  const capped = discount.type === "percent" && discount.max !== undefined ? Math.min(raw, discount.max) : raw;
  return Math.min(capped, subtotal);
}
