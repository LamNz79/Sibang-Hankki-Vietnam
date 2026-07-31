import dayjs from "dayjs";

export type CuisineKey =
  | "korean"
  | "chinese"
  | "vietnamese"
  | "japanese"
  | "western";
export type BenefitKey = "special_deal" | "available" | "date_night" | "michelin";

export type RestaurantRecord = {
  slug: string;
  name: string;
  citySlug: "ho-chi-minh-city" | "hanoi" | "da-nang";
  area: string;
  district: string;
  cuisineLabel: string;
  cuisineKey: CuisineKey;
  rating: number;
  ratingCount: number;
  priceRangeLabel: string;
  heroAccent: string;
  openHours: string;
  address: string;
  availableText: string;
  availableFrom: string;
  priceKey: "under150" | "under300" | "over300";
  benefits: BenefitKey[];
  tags: string[];
  galleryCount: number;
  summary: string;
  slotMatrix: Record<string, Record<string, string[]>>;
};

const demoSlotPatterns = [
  {
    "2": ["18:00", "18:30", "19:00", "19:30", "20:00"],
    "4": ["18:30", "19:00", "20:00"],
    "6": ["19:30", "20:30"],
  },
  {
    "2": ["17:30", "18:30", "19:30", "20:30"],
    "4": ["18:00", "19:00", "20:30"],
    "6": ["20:00"],
  },
  {
    "2": ["18:30", "19:00", "20:00", "20:30"],
    "4": ["19:00", "19:30"],
    "6": ["20:30"],
  },
  {
    "2": ["18:00", "19:00", "19:30"],
    "4": ["18:30", "20:00"],
    "6": ["19:30"],
  },
] as const;

function createDemoSlotMatrix(
  restaurantVariant: number,
): Record<string, Record<string, string[]>> {
  const startDate = dayjs().startOf("day");

  return Object.fromEntries(
    Array.from({ length: 61 }, (_, offset) => {
      const date = startDate.add(offset, "day");
      const weekday = date.day();
      const isClosed =
        (restaurantVariant % 2 === 0 && weekday === 1) ||
        (restaurantVariant % 2 === 1 && weekday === 2);

      if (isClosed) {
        return [
          date.format("YYYY-MM-DD"),
          { "2": [], "4": [], "6": [] },
        ];
      }

      const pattern =
        demoSlotPatterns[
          (offset + weekday + restaurantVariant) % demoSlotPatterns.length
        ];

      return [
        date.format("YYYY-MM-DD"),
        {
          "2": [...pattern["2"]],
          "4": [...pattern["4"]],
          "6": [...pattern["6"]],
        },
      ];
    }),
  );
}

export const restaurantRecords: RestaurantRecord[] = [
  {
    slug: "anan-saigon",
    name: "Anan Saigon",
    citySlug: "ho-chi-minh-city",
    area: "District 1",
    district: "District 1",
    cuisineLabel: "Vietnamese contemporary",
    cuisineKey: "vietnamese",
    rating: 4.7,
    ratingCount: 139,
    priceRangeLabel: "150K - 350K",
    heroAccent: "#f6ede4",
    openHours: "11:30 - 22:00",
    address: "District 1",
    availableText: "Available today from 18:30",
    availableFrom: "18:30",
    priceKey: "under300",
    benefits: ["michelin", "special_deal", "available"],
    tags: ["Michelin", "Special deal", "Date night"],
    galleryCount: 5,
    summary: "Modern Vietnamese tasting menus with refined plating and a lively city-dining atmosphere.",
    slotMatrix: createDemoSlotMatrix(0),
  },
  {
    slug: "royal-pavilion",
    name: "The Royal Pavilion",
    citySlug: "ho-chi-minh-city",
    area: "District 1",
    district: "District 1",
    cuisineLabel: "Chinese",
    cuisineKey: "chinese",
    rating: 4.7,
    ratingCount: 166,
    priceRangeLabel: "350K - 500K",
    heroAccent: "#edf5f4",
    openHours: "11:30 - 22:00",
    address: "District 1",
    availableText: "Available today from 18:30",
    availableFrom: "18:30",
    priceKey: "over300",
    benefits: ["available", "date_night"],
    tags: ["Michelin", "Special deal", "Date night"],
    galleryCount: 5,
    summary: "Elegant Cantonese dining with private-table ambience and evening reservation demand.",
    slotMatrix: createDemoSlotMatrix(1),
  },
  {
    slug: "refinery",
    name: "The Refinery",
    citySlug: "ho-chi-minh-city",
    area: "District 1",
    district: "District 1",
    cuisineLabel: "French",
    cuisineKey: "western",
    rating: 4.7,
    ratingCount: 121,
    priceRangeLabel: "350K - 500K",
    heroAccent: "#eef4f7",
    openHours: "11:30 - 22:00",
    address: "District 1",
    availableText: "Available today from 18:30",
    availableFrom: "18:30",
    priceKey: "over300",
    benefits: ["date_night"],
    tags: ["Date night"],
    galleryCount: 4,
    summary: "French comfort dining in a restored colonial setting with strong dinner demand.",
    slotMatrix: createDemoSlotMatrix(2),
  },
  {
    slug: "mori-teppan",
    name: "Mori Teppan",
    citySlug: "ho-chi-minh-city",
    area: "Binh Thanh",
    district: "Binh Thanh",
    cuisineLabel: "Japanese",
    cuisineKey: "japanese",
    rating: 4.6,
    ratingCount: 98,
    priceRangeLabel: "150K - 300K",
    heroAccent: "#edf2f8",
    openHours: "17:30 - 22:30",
    address: "Binh Thanh",
    availableText: "Available today from 20:00",
    availableFrom: "20:00",
    priceKey: "under300",
    benefits: ["available"],
    tags: ["Available"],
    galleryCount: 3,
    summary: "Interactive teppan-style dinner counters that work best for small evening parties.",
    slotMatrix: createDemoSlotMatrix(3),
  },
  {
    slug: "hanoi-hearth",
    name: "Hanoi Hearth",
    citySlug: "hanoi",
    area: "Hoan Kiem",
    district: "Hoan Kiem",
    cuisineLabel: "Vietnamese",
    cuisineKey: "vietnamese",
    rating: 4.6,
    ratingCount: 87,
    priceRangeLabel: "150K - 300K",
    heroAccent: "#f2ede6",
    openHours: "11:00 - 22:00",
    address: "Hoan Kiem, Hanoi",
    availableText: "Available today from 18:00",
    availableFrom: "18:00",
    priceKey: "under300",
    benefits: ["available", "date_night"],
    tags: ["Available", "Date night"],
    galleryCount: 4,
    summary: "Contemporary northern Vietnamese dishes in a warm dining room near the Old Quarter.",
    slotMatrix: createDemoSlotMatrix(4),
  },
  {
    slug: "han-river-dining",
    name: "Han River Dining",
    citySlug: "da-nang",
    area: "Son Tra",
    district: "Son Tra",
    cuisineLabel: "Vietnamese seafood",
    cuisineKey: "vietnamese",
    rating: 4.5,
    ratingCount: 74,
    priceRangeLabel: "150K - 350K",
    heroAccent: "#e8f3f5",
    openHours: "16:30 - 22:30",
    address: "Son Tra, Da Nang",
    availableText: "Available today from 18:30",
    availableFrom: "18:30",
    priceKey: "under300",
    benefits: ["available", "special_deal"],
    tags: ["Available", "Special deal"],
    galleryCount: 5,
    summary: "Relaxed riverside dining focused on central Vietnamese seafood and shareable evening menus.",
    slotMatrix: createDemoSlotMatrix(5),
  },
];

export function getRestaurantBySlug(slug: string) {
  return restaurantRecords.find((restaurant) => restaurant.slug === slug);
}
export function getRestaurantAvailabilitySummary(
  restaurant: RestaurantRecord,
  referenceDate = dayjs().format("YYYY-MM-DD"),
) {
  const todaySlots = Object.values(restaurant.slotMatrix[referenceDate] ?? {}).flat();
  const earliestToday = [...todaySlots].sort()[0];

  if (earliestToday) {
    return {
      label: `Available today from ${earliestToday}`,
      hint: "Choose your exact date, time, and party size in the booking step.",
      tone: "today" as const,
    };
  }

  const nextAvailableEntry = Object.entries(restaurant.slotMatrix)
    .filter(([date]) => date > referenceDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .find(([, guests]) => Object.values(guests).some((slots) => slots.length > 0));

  if (nextAvailableEntry) {
    const [date, guests] = nextAvailableEntry;
    const earliest = Object.values(guests).flat().sort()[0];
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date(`${date}T00:00:00`));

    return {
      label: `Next available ${formattedDate}${earliest ? ` · ${earliest}` : ""}`,
      hint: "Tap through to see more dates and times.",
      tone: "next" as const,
    };
  }

  return {
    label: "Select a date to check availability",
    hint: "Open the booking step to explore future slots.",
    tone: "later" as const,
  };
}
