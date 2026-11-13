// shortcut: sample catalog and delivery pricing, replace with the shop API when business rules are confirmed.
export const products = [
  { id: "serum", name: "Glow Serum", brand: "Beauty of Joseon", category: "beauty", price: 380000, image: "glow-serum.png", contents: "30 ml", badge: "NEW" },
  { id: "tint", name: "Juicy Lasting Tint", brand: "rom&nd", category: "beauty", price: 240000, image: "lip-tint.jpg", contents: "25 Bare Grape · 5.5 g", badge: "COLOR PICK" },
  { id: "dimsum", name: "Royal Shrimp Dim Sum Set", brand: "The Royal Pavilion", category: "food", price: 360000, image: "dumplings.jpg", contents: "12 pcs", badge: "SIGNATURE" },
  { id: "coffee", name: "Vietnamese Drip Bag Coffee", brand: "Bean in Love", category: "drinks", price: 180000, image: "coffee.jpg", contents: "8 drip bags", badge: "LOCAL FIND" },
  { id: "cream", name: "Dynasty Cream", brand: "Beauty of Joseon", category: "beauty", price: 450000, image: "dynasty-cream.jpg", contents: "50 ml", badge: "SKINCARE" },
  { id: "duck", name: "Signature Roast Duck", brand: "The Royal Pavilion", category: "food", price: 450000, image: "duck.jpg", contents: "2 servings", badge: "CHEF'S PICK" },
  { id: "tea", name: "Premium Jasmine Tea", brand: "Sibang Select", category: "drinks", price: 220000, image: "tea.jpg", contents: "100 g", badge: "SIBANG SELECT" },
  { id: "siumai", name: "Tobiko Siu Mai Box", brand: "The Royal Pavilion", category: "food", price: 280000, image: "siu-mai.jpg", contents: "8 pcs", badge: "CHILLED" },
  { id: "abalone", name: "Premium Abalone Dining Set", brand: "The Royal Pavilion", category: "gifts", price: 650000, image: "abalone.jpg", contents: "2 servings", badge: "GIFT PICK" },
] as const;

export type Product = (typeof products)[number];
export type Cart = Record<string, number>;

export function cartTotals(cart: Cart) {
  const subtotal = products.reduce((sum, product) => sum + product.price * (cart[product.id] ?? 0), 0);
  const delivery = subtotal === 0 || subtotal >= 500000 ? 0 : 30000;
  return { subtotal, delivery, total: subtotal + delivery };
}
