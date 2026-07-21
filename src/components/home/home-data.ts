import {
  IconFlame,
  IconHeart,
  IconPercentage,
  IconStar,
  IconTrendingUp,
} from "@tabler/icons-react";

export const categories = [
  { label: "Michelin", icon: IconStar, color: "#d46d5b" },
  { label: "Buffet", icon: IconFlame, color: "#cb9830" },
  { label: "Deals", icon: IconPercentage, color: "#007487" },
  { label: "Date Night", icon: IconHeart, color: "#cc6c73" },
  { label: "Trending", icon: IconTrendingUp, color: "#0a8292" },
];

export const quickStats = [
  { label: "Open tonight", value: "128+" },
  { label: "Instant confirm", value: "42" },
  { label: "Hot deals", value: "16" },
];

export const cityTiles = [
  {
    label: "District 1",
    badge: "Popular",
    background: "linear-gradient(135deg, #84613d 0%, #d4a46f 100%)",
  },
  {
    label: "District 7",
    badge: undefined,
    background: "linear-gradient(135deg, #5a8eb6 0%, #b7d4eb 100%)",
  },
  {
    label: "Binh Thanh",
    badge: "Hot",
    background: "linear-gradient(135deg, #6089aa 0%, #d6e8f7 100%)",
  },
  {
    label: "Thu Duc",
    badge: undefined,
    background: "linear-gradient(135deg, #6d987b 0%, #d7eadc 100%)",
  },
  {
    label: "Phu Nhuan",
    badge: undefined,
    background: "linear-gradient(135deg, #5fa0b4 0%, #d2edf1 100%)",
  },
  {
    label: "Tan Binh",
    badge: "New",
    background: "linear-gradient(135deg, #83614d 0%, #e6b58f 100%)",
  },
];

export const cuisines = ["Western", "Chinese", "Vietnamese", "Japanese"];
export const priceRanges = ["Under 150K", "150K~300K", "Over 300K"];
export const popularAreas = ["District 1", "District 7", "Binh Thanh", "Thu Duc", "Phu Nhuan"];
export const recentAreas = ["District 1", "Binh Thanh", "Thu Duc"];

export const locationGroups = {
  "Ho Chi Minh": ["District 1", "District 7", "Binh Thanh", "Thu Duc", "Phu Nhuan", "Tan Binh"],
  Hanoi: ["Hoan Kiem", "Ba Dinh", "Tay Ho", "Cau Giay", "Dong Da"],
  "Da Nang": ["Hai Chau", "Son Tra", "Ngu Hanh Son", "Thanh Khe"],
};
