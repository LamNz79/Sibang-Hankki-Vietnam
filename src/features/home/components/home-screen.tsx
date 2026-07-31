"use client";

import { Box, Group, SimpleGrid, Text } from "@mantine/core";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav, MobileShell } from "@/components/layout/customer";
import { SectionTitle } from "@/components/ui";
import { HomeHeader } from "@/features/home/components/home-header";
import {
  ChipRow,
  CityTileGrid,
  HeroBanner,
} from "@/features/home/components/home-sections";
import { LocationDrawer } from "@/features/home/components/location-drawer";
import { SpecialCategories } from "@/features/home/components/special-categories";
import {
  categories,
  cityTiles,
  cuisines,
  priceRanges,
} from "@/features/home/data/home-data";
import { uiColors } from "@/theme";

const quickSortOptions = ["Recommended", "Top rated", "Earliest available"];
const sortQueryValues: Record<string, string> = {
  Recommended: "recommended",
  "Top rated": "rating",
  "Earliest available": "earliest",
};
const cuisineQueryValues: Record<string, string> = {
  Western: "western",
  Chinese: "chinese",
  Vietnamese: "vietnamese",
  Japanese: "japanese",
};
const priceQueryValues: Record<string, string> = {
  "Under 150K": "under150",
  "150K-300K": "under300",
  "Over 300K": "over300",
};

export function HomeScreen() {
  const router = useRouter();
  const [location, setLocation] = useState("Ho Chi Minh City");
  const [locationOpened, setLocationOpened] = useState(false);

  const openRestaurantList = (key: "sort" | "cuisine" | "price", value: string) => {
    const params = new URLSearchParams({ location, [key]: value });
    router.push(`/restaurants?${params.toString()}`);
  };

  return (
    <MobileShell
      title="Sibang Hankki"
      subtitle="Find a table fast and book with confidence."
      withHeaderBorder={false}
      bottomNav={<BottomNav activePath="/" />}
      headerContent={
        <HomeHeader
          location={location}
          onOpenLocation={() => setLocationOpened(true)}
        />
      }
    >
      <LocationDrawer
        opened={locationOpened}
        onClose={() => setLocationOpened(false)}
        selectedLocation={location}
        onSelectLocation={(nextLocation) => {
          setLocation(nextLocation);
          setLocationOpened(false);
        }}
      />

      <HeroBanner />

      <Group justify="space-between" align="flex-end">
        <SectionTitle title="Special categories" />
        <Text size="sm" c={uiColors.textMuted} mb={4}>
          Up to 5
        </Text>
      </Group>

      <SimpleGrid cols={5} spacing="sm" verticalSpacing="sm">
        {categories.map((item) => {
          return (
            <Link
              key={item.label}
              href={`/restaurants?category=${item.slug}&location=${encodeURIComponent(location)}`}
              style={{ textDecoration: "none", display: "block" }}
            >
              <SpecialCategories item={item} />
            </Link>
          );
        })}
      </SimpleGrid>

      <Group justify="space-between" align="flex-end">
        <SectionTitle title="Explore by city" />
        <Text size="sm" c={uiColors.textSecondary} mb={4}>
          View all
        </Text>
      </Group>
      <CityTileGrid items={cityTiles} />

      <Box>
        <SectionTitle title="Sort by" />
        <ChipRow
          items={quickSortOptions}
          onChange={(value) => openRestaurantList("sort", sortQueryValues[value])}
        />
      </Box>

      <Box>
        <SectionTitle title="Cuisine" />
        <ChipRow
          items={cuisines}
          onChange={(value) => openRestaurantList("cuisine", cuisineQueryValues[value])}
        />
      </Box>

      <Box>
        <SectionTitle title="Price range" />
        <ChipRow
          items={priceRanges}
          onChange={(value) => openRestaurantList("price", priceQueryValues[value])}
          compact
        />
      </Box>
    </MobileShell>
  );
}
