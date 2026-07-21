"use client";

import { Box, Group, SimpleGrid, Text } from "@mantine/core";
import Link from "next/link";
import { useState } from "react";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { MobileShell } from "@/components/app-shell/mobile-shell";
import { HomeHeader } from "@/components/home/home-header";
import { categories, cityTiles, cuisines, priceRanges } from "@/components/home/home-data";
import { ChipRow, CityTileGrid, HeroBanner } from "@/components/home/home-sections";
import { LocationDrawer } from "@/components/home/location-drawer";
import { SectionTitle } from "@/components/ui/section-title";
import SpecialCategories from "@/components/home/special-categories";

export default function Home() {
  const [location, setLocation] = useState("Ho Chi Minh City");
  const [locationOpened, setLocationOpened] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState(cuisines[0]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);

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
              href={`/restaurants?category=${item.slug}`}
              style={{ textDecoration: "none", display: "block" }}
            >
              <SpecialCategories item={item} />
            </Link>
          );
        })}
      </SimpleGrid>

      <Group justify="space-between" align="flex-end">
        <SectionTitle title="Popular cities" />
        <Text size="sm" c="#6f7d78" mb={4}>
          View all
        </Text>
      </Group>
      <CityTileGrid
        items={cityTiles}
        selectedValue={location}
        onSelect={setLocation}
      />

      <Box>
        <SectionTitle title="Cuisine" />
        <ChipRow
          items={cuisines}
          value={selectedCuisine}
          onChange={setSelectedCuisine}
        />
      </Box>

      <Box>
        <SectionTitle title="Price range" />
        <ChipRow
          items={priceRanges}
          value={selectedPriceRange}
          onChange={setSelectedPriceRange}
          compact
        />
      </Box>
    </MobileShell>
  );
}
