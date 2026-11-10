import type { RestaurantMenuItem } from "@/features/restaurants/data/types";

const sampleImageByItemName: Record<string, string> = {
  "Har Gow": "/images/sample/food/har-gow.jpg",
  "Siu Mai with Tobiko": "/images/sample/food/siu-mai-tobiko.jpg",
  "Braised Abalone with Seasonal Greens": "/images/sample/food/braised-abalone.jpg",
  "Crispy Roasted Duck": "/images/sample/food/cantonese-roast-duck.jpg",
  "Wok-fried Beef Tenderloin": "/images/sample/food/wok-fried-beef-tenderloin.jpg",
};

export function menuItemImageUrl(item: Pick<RestaurantMenuItem, "name" | "imageUrl">) {
  // shortcut: demo dishes use bundled images until the seed data persists imageUrl.
  return item.imageUrl ?? sampleImageByItemName[item.name] ?? null;
}
