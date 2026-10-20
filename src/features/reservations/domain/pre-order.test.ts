import { describe, expect, it } from "vitest";
import type { RestaurantMenuCategory } from "@/features/restaurants/data/mock-data";
import { buildPreOrderNote } from "./pre-order";

const categories: RestaurantMenuCategory[] = [
  {
    id: "mains",
    name: "Mains",
    displayOrder: 1,
    items: [
      {
        id: "pho",
        name: "Beef pho",
        description: null,
        price: 120_000,
        currency: "VND",
        imageUrl: null,
      },
      {
        id: "rice",
        name: "Chicken rice",
        description: null,
        price: 90_000,
        currency: "VND",
        imageUrl: null,
      },
    ],
  },
];

describe("buildPreOrderNote", () => {
  it("serializes selected dishes in menu order and appends the guest note", () => {
    expect(
      buildPreOrderNote(categories, { rice: 1, pho: 2 }, "No peanuts"),
    ).toBe("Beef pho x2; Chicken rice x1; No peanuts");
  });

  it("returns an empty value when no dish or note is provided", () => {
    expect(buildPreOrderNote(categories, {}, "  ")).toBe("");
  });
});
