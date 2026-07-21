"use client";

import { Badge, Box, Card, Group, SimpleGrid, Text, ThemeIcon, Title } from "@mantine/core";
import { useState } from "react";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { MobileShell } from "@/components/app-shell/mobile-shell";
import { HomeHeader } from "@/components/home/home-header";
import { categories, cityTiles, cuisines, priceRanges } from "@/components/home/home-data";
import { LocationDrawer } from "@/components/home/location-drawer";
import {
  ChipRow,
  CityTileGrid,
  FilterSection,
  HeroBanner,
} from "@/components/home/home-sections";
import { SectionTitle } from "@/components/ui/section-title";

export default function Home() {
  const [location, setLocation] = useState("Ho Chi Minh");
  const [locationOpened, setLocationOpened] = useState(false);

  return (
    <MobileShell
      title="Sibang Hankki"
      subtitle="Find a table fast and book with confidence."
      bottomNav={<BottomNav activePath="/" />}
      headerContent={
        <HomeHeader location={location} onOpenLocation={() => setLocationOpened(true)} />
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

      <SectionTitle title="Featured Categories" />
      <SimpleGrid cols={3} spacing="sm" verticalSpacing="sm">
        {categories.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.label}
              href={`/restaurants?category=${item.slug}`}
              style={{ textDecoration: "none" }}
            >
              <Card
                radius="xl"
                p="sm"
                style={{
                  background: "rgba(255, 251, 247, 0.9)",
                  border: "1px solid rgba(207, 183, 145, 0.18)",
                }}
              >
                <Group gap={10} wrap="nowrap">
                  <ThemeIcon
                    variant="light"
                    radius="xl"
                    size={38}
                    style={{
                      color: item.color,
                      background: "white",
                      border: `1px solid ${item.color}`,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} />
                  </ThemeIcon>
                  <Text size="sm" fw={600} c="#24322e">
                    {item.label}
                  </Text>
                </Group>
              </Card>
            </a>
          );
        })}
      </SimpleGrid>

      <FilterSection title="City" description="Choose where you want to dine first.">
        <CityTileGrid items={cityTiles} />
      </FilterSection>

      <SimpleGrid cols={2} spacing="md" verticalSpacing="md">
        <FilterSection title="Cuisine" description="Pick a dining mood.">
          <ChipRow items={cuisines} />
        </FilterSection>

        <FilterSection title="Price Range" description="Match the budget.">
          <ChipRow items={priceRanges} defaultValue="150K~300K" compact />
        </FilterSection>
      </SimpleGrid>

      <Card
        radius="xl"
        p="lg"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(247,240,232,0.98) 100%)",
          border: "1px solid rgba(207, 183, 145, 0.2)",
        }}
      >
        <Group justify="space-between" align="center">
          <Box>
            <Text size="sm" c="#7d7366">
              This week&apos;s focus
            </Text>
            <Title order={3} size="h4" c="#21312c">
              Instant booking first
            </Title>
          </Box>
          <Badge color="oligoTeal" radius="xl" variant="light">
            MVP priority
          </Badge>
        </Group>
      </Card>
    </MobileShell>
  );
}
