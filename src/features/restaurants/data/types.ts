export type CuisineKey =
  | "korean"
  | "chinese"
  | "vietnamese"
  | "japanese"
  | "western";

export type BenefitKey =
  | "special_deal"
  | "available"
  | "date_night"
  | "michelin";

export type RestaurantMenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
};

export type RestaurantMenuCategory = {
  id: string;
  name: string;
  displayOrder: number;
  items: RestaurantMenuItem[];
};

export type RestaurantBookingPolicy = {
  bookingWindowDays: number;
  minimumPartySize: number;
  maximumOnlinePartySize: number;
  largePartyThreshold: number;
};

export type RestaurantSummary = {
  slug: string;
  name: string;
  citySlug: string;
  area: string;
  cuisineLabel: string;
  cuisineKey: string;
  rating: number;
  heroAccent: string;
  imageUrl: string | null;
  imageAlt: string | null;
  availableText: string | null;
  availableFrom: string | null;
  priceKey: "under150" | "under300" | "over300";
  benefits: string[];
};

export type RestaurantRecord = RestaurantSummary & {
  district: string;
  ratingCount: number;
  priceRangeLabel: string;
  openHours: string;
  address: string;
  tags: string[];
  galleryCount: number;
  galleryImages: { imageUrl: string; imageAlt: string | null }[];
  summary: string;
  slotMatrix: Record<string, Record<string, string[]>>;
  menuCategories: RestaurantMenuCategory[];
  bookingPolicy?: RestaurantBookingPolicy;
};
