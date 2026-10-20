import type { RestaurantMenuCategory } from "@/features/restaurants/data/mock-data";

export function buildPreOrderNote(
  categories: RestaurantMenuCategory[],
  quantities: Record<string, number>,
  note: string,
) {
  const items = categories.flatMap((category) =>
    category.items
      .filter((item) => (quantities[item.id] ?? 0) > 0)
      .map((item) => `${item.name} x${quantities[item.id]}`),
  );
  const trimmedNote = note.trim();

  return [...items, ...(trimmedNote ? [trimmedNote] : [])].join("; ");
}
