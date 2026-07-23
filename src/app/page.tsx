"use client";

import { Box, Group, SimpleGrid, Text } from "@mantine/core";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { MobileShell } from "@/components/app-shell/mobile-shell";
import { HomeHeader } from "@/components/home/home-header";
import { categories, cityTiles, cuisines, priceRanges } from "@/components/home/home-data";
import { ChipRow, CityTileGrid, HeroBanner } from "@/components/home/home-sections";
import { LocationDrawer } from "@/components/home/location-drawer";
import { SectionTitle } from "@/components/ui/section-title";
import SpecialCategories from "@/components/home/special-categories";

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

export default function Home() {
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
        <Text size="sm" c="#8a8f89" mb={4}>
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
        <Text size="sm" c="#6f7d78" mb={4}>
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
