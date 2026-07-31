import {
  IconFlame,
  IconHeart,
  IconPercentage,
  IconStar,
  IconTrendingUp,
} from "@tabler/icons-react";
import { uiColors } from "@/theme";

export const categories = [
  { label: "Michelin", slug: "michelin", icon: IconStar, color: uiColors.brandPrimaryMuted },
  { label: "Buffet", slug: "buffet", icon: IconFlame, color: uiColors.brandPrimaryMuted },
  { label: "Special deal", slug: "special-deal", icon: IconPercentage, color: uiColors.brandPrimaryMuted },
  { label: "Date night", slug: "date-night", icon: IconHeart, color: uiColors.brandPrimaryMuted },
  { label: "Trending", slug: "trending", icon: IconTrendingUp, color: uiColors.brandPrimaryMuted },
];

export const cityTiles = [
  {
    label: "Ho Chi Minh City",
    slug: "ho-chi-minh-city",
    badge: undefined,
    background: "linear-gradient(135deg, #6da1c3 0%, #c4d9ea 100%)",
  },
  {
    label: "Hanoi",
    slug: "hanoi",
    badge: undefined,
    background: "linear-gradient(135deg, #6b635e 0%, #afa59d 100%)",
  },
  {
    label: "Da Nang",
    slug: "da-nang",
    badge: undefined,
    background: "linear-gradient(135deg, #90b7d8 0%, #cfe2f1 100%)",
  },
];

export const cuisines = ["Western", "Chinese", "Vietnamese", "Japanese"];
export const priceRanges = ["Under 150K", "150K-300K", "Over 300K"];

export const popularAreas = ["District 1", "District 7", "Binh Thanh", "Thu Duc", "Phu Nhuan"];
export const recentAreas = ["District 1", "Binh Thanh", "Thu Duc"];

export const locationGroups = {
  "Ho Chi Minh": ["District 1", "District 7", "Binh Thanh", "Thu Duc", "Phu Nhuan", "Tan Binh"],
  Hanoi: ["Hoan Kiem", "Ba Dinh", "Tay Ho", "Cau Giay", "Dong Da"],
  "Da Nang": ["Hai Chau", "Son Tra", "Ngu Hanh Son", "Thanh Khe"],
};
