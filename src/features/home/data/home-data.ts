import {
  IconFlame,
  IconHeart,
  IconPercentage,
  IconStar,
  IconTrendingUp,
} from "@tabler/icons-react";
export const categories = [
  { label: "Michelin", slug: "michelin", icon: IconStar, image: "/images/sample/restaurants/royal-pavilion-interior.jpg" },
  { label: "Buffet", slug: "buffet", icon: IconFlame, image: "/images/sample/food/korean-bbq-beef.jpg" },
  { label: "Special deal", slug: "special-deal", icon: IconPercentage, image: "/images/sample/food/cantonese-roast-duck.jpg" },
  { label: "Date night", slug: "date-night", icon: IconHeart, image: "/images/sample/restaurants/royal-pavilion-private-dining.jpg" },
  { label: "Trending", slug: "trending", icon: IconTrendingUp, image: "/images/sample/food/pho-bo.jpg" },
] as const;

export const cityTiles = [
  {
    label: "Ho Chi Minh City",
    slug: "ho-chi-minh",
    badge: undefined,
    background: "url('/images/sample/cities/ho-chi-minh-city.jpg') center / cover",
  },
  {
    label: "Hanoi",
    slug: "hanoi",
    badge: undefined,
    background: "url('/images/sample/cities/hanoi.jpg') center / cover",
  },
  {
    label: "Da Nang",
    slug: "da-nang",
    badge: undefined,
    background: "url('/images/sample/cities/da-nang.jpg') center / cover",
  },
];

export const cuisines = ["Western", "Chinese", "Vietnamese", "Japanese"];
export const priceRanges = ["Under 150K", "150K-300K", "Over 300K"];
