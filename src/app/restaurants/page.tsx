"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Card,
  Chip,
  Drawer,
  Group,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAdjustmentsHorizontal,
  IconArrowsSort,
  IconClock,
  IconSearch,
  IconStarFilled,
} from "@tabler/icons-react";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { MobileShell } from "@/components/app-shell/mobile-shell";
import { categories } from "@/components/home/home-data";
import {
  getRestaurantAvailabilitySummary,
  restaurantRecords,
  type BenefitKey,
  type CuisineKey,
} from "@/features/restaurants/mock-data";
import { uiColors } from "@/components/ui/theme-tokens";

type SortKey = "recommended" | "rating" | "earliest";
type PriceKey = "all" | "under150" | "under300" | "over300";

const sortOptions: SortKey[] = ["recommended", "rating", "earliest"];
const sortLabels: Record<SortKey, string> = { recommended: "Recommended", rating: "Top rated", earliest: "Earliest" };
const priceOptions: PriceKey[] = ["all", "under150", "under300", "over300"];
const priceLabels: Record<PriceKey, string> = { all: "Price", under150: "< 150K", under300: "150K-300K", over300: "> 300K" };
const priceOptionLabels: Record<PriceKey, string> = { all: "All", under150: "Under 150K", under300: "150K-300K", over300: "Over 300K" };
const cuisineOptions: (CuisineKey | "all")[] = ["all", "korean", "chinese", "vietnamese", "japanese", "western"];
const cuisineLabels: Record<CuisineKey | "all", string> = { all: "Cuisine", korean: "Korean", chinese: "Chinese", vietnamese: "Vietnamese", japanese: "Japanese", western: "Western" };
const benefitOptions: BenefitKey[] = ["special_deal", "available", "date_night", "michelin"];
const benefitLabels: Record<BenefitKey, string> = { special_deal: "Special deal", available: "Available", date_night: "Date night", michelin: "Michelin" };
const cityLabels: Record<string, string> = {
  "ho-chi-minh-city": "Ho Chi Minh City",
  hanoi: "Hanoi",
  "da-nang": "Da Nang",
};

const actionChipStyles = { label: { borderRadius: 999, background: uiColors.surface, border: `1px solid ${uiColors.borderStrong}`, minHeight: 40, paddingInline: 14, color: uiColors.textPrimary, fontWeight: 500 }, iconWrapper: { display: "none" } };
function nextOption<T>(list: readonly T[], current: T): T { const i = list.indexOf(current); return list[(i + 1) % list.length]; }
function isOption<T extends string>(options: readonly T[], value: string | null): value is T {
  return value !== null && (options as readonly string[]).includes(value);
}
function filterChipStyles(active: boolean) { return active ? { label: { borderRadius: 10, background: uiColors.brandPrimarySoft, border: `1px solid ${uiColors.brandPrimary}`, minHeight: 42, color: uiColors.brandPrimary, fontWeight: 600 }, iconWrapper: { display: "none" } } : { label: { borderRadius: 10, background: uiColors.surface, border: `1px solid ${uiColors.border}`, minHeight: 42, color: uiColors.textPrimary, fontWeight: 500 }, iconWrapper: { display: "none" } }; }

function RestaurantsContent() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category") ?? undefined;
  const citySlug = searchParams.get("city") ?? undefined;
  const locationScope = searchParams.get("location") ?? undefined;
  const selectedCategory = categories.find((item) => item.slug === categorySlug);
  const selectedCity = citySlug ? cityLabels[citySlug] : undefined;
  const searchScope = selectedCity ?? locationScope ?? "Ho Chi Minh City";
  const pageTitle = selectedCategory
    ? `${selectedCategory.label} in ${searchScope}`
    : selectedCity
      ? `Restaurants in ${selectedCity}`
      : "Restaurant List";
  const [sortBy, setSortBy] = useState<SortKey>(() => {
    const requested = searchParams.get("sort");
    return isOption(sortOptions, requested) ? requested : "recommended";
  });
  const [priceFilter, setPriceFilter] = useState<PriceKey>(() => {
    const requested = searchParams.get("price");
    return isOption(priceOptions, requested) ? requested : "all";
  });
  const [cuisineFilter, setCuisineFilter] = useState<CuisineKey | "all">(() => {
    const requested = searchParams.get("cuisine");
    return isOption(cuisineOptions, requested) ? requested : "all";
  });
  const [selectedBenefits, setSelectedBenefits] = useState<BenefitKey[]>([]);
  const [filtersOpened, setFiltersOpened] = useState(false);
  const [query, setQuery] = useState("");

  const filteredRestaurants = useMemo(() => {
    let list = restaurantRecords.filter((restaurant) => {
      const haystack = `${restaurant.name} ${restaurant.area} ${restaurant.cuisineLabel}`.toLowerCase();
      const matchesQuery = query.trim().length === 0 || haystack.includes(query.trim().toLowerCase());
      const matchesCity = !citySlug || restaurant.citySlug === citySlug;
      const matchesPrice = priceFilter === "all" || restaurant.priceKey === priceFilter;
      const matchesCuisine = cuisineFilter === "all" || restaurant.cuisineKey === cuisineFilter;
      const matchesBenefits = selectedBenefits.length === 0 || selectedBenefits.every((benefit) => restaurant.benefits.includes(benefit));
      return matchesQuery && matchesCity && matchesPrice && matchesCuisine && matchesBenefits;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "earliest") return a.availableFrom.localeCompare(b.availableFrom);
      return b.rating - a.rating;
    });

    return list;
  }, [citySlug, cuisineFilter, priceFilter, query, selectedBenefits, sortBy]);

  const resetFilters = () => {
    setPriceFilter("all");
    setCuisineFilter("all");
    setSelectedBenefits([]);
  };

  return (
    <>
      <MobileShell title={pageTitle} subtitle="Filtered results" backHref="/" bottomNav={<BottomNav activePath="/restaurants" />}>
        <TextInput radius="xl" size="md" placeholder="Search restaurant or area" value={query} onChange={(e) => setQuery(e.currentTarget.value)} leftSection={<IconSearch size={16} color={uiColors.textSecondary} />} styles={{ input: { border: `1px solid ${uiColors.border}`, background: uiColors.surface, height: 50, color: uiColors.textPrimary } }} />

        <Card radius="lg" p="md" style={{ background: uiColors.surfaceAlt, border: `1px solid ${uiColors.border}` }}>
          <Group wrap="nowrap" align="flex-start">
            <ThemeIcon radius="xl" size={40} variant="light" style={{ background: uiColors.brandPrimarySoft, color: uiColors.brandPrimary, flexShrink: 0 }}>
              <IconClock size={18} />
            </ThemeIcon>
            <Stack gap={2}>
              <Text fw={700} c={uiColors.textPrimary}>Availability is shown per restaurant</Text>
              <Text size="sm" c={uiColors.textSecondary}>Browse first, then choose the exact date, time, and party size in the booking step.</Text>
            </Stack>
          </Group>
        </Card>

        <Group gap="xs" wrap="nowrap" style={{ overflowX: "auto" }} className="hide-scrollbar">
          <Chip radius="xl" size="sm" checked={Boolean(selectedCategory)} readOnly styles={{ label: { borderRadius: 10, background: uiColors.brandPrimarySoft, border: `1px solid ${uiColors.border}`, minHeight: 30, paddingInline: 10, color: uiColors.brandPrimary, fontWeight: 600 }, iconWrapper: { display: "none" } }}>{selectedCategory?.label ?? "All"}</Chip>
          {[searchScope, "Available"].map((item) => <Chip key={item} radius="xl" size="sm" checked readOnly styles={{ label: { borderRadius: 10, background: uiColors.surfaceMuted, border: `1px solid ${uiColors.border}`, minHeight: 30, paddingInline: 10, color: uiColors.textPrimary, fontWeight: 600 }, iconWrapper: { display: "none" } }}>{item}</Chip>)}
        </Group>

        <Box style={{ position: "sticky", top: 0, zIndex: 30, marginInline: -16, marginTop: -6, paddingInline: 16, paddingTop: 10, paddingBottom: 12, background: "rgba(255,255,255,0.98)", backdropFilter: "blur(16px)", borderTop: `1px solid ${uiColors.surface}`, borderBottom: `1px solid ${uiColors.border}`, boxShadow: "0 10px 24px rgba(32, 49, 44, 0.08)" }}>
          <Group gap="sm" wrap="nowrap" style={{ overflowX: "auto" }} className="hide-scrollbar">
            <Chip radius="xl" size="md" checked={sortBy !== "recommended"} onChange={() => setSortBy((current) => nextOption(sortOptions, current))} styles={sortBy !== "recommended" ? { label: { borderRadius: 999, background: uiColors.surface, border: `1px solid ${uiColors.brandPrimary}`, minHeight: 40, paddingInline: 14, color: uiColors.brandPrimary, fontWeight: 600 }, iconWrapper: { display: "none" } } : actionChipStyles} icon={<IconArrowsSort size={14} />}>{sortLabels[sortBy]}</Chip>
            <Chip radius="xl" size="md" checked={filtersOpened || priceFilter !== "all" || cuisineFilter !== "all" || selectedBenefits.length > 0} onChange={() => setFiltersOpened(true)} styles={filtersOpened || priceFilter !== "all" || cuisineFilter !== "all" || selectedBenefits.length > 0 ? { label: { borderRadius: 999, background: uiColors.surface, border: `1px solid ${uiColors.brandPrimary}`, minHeight: 40, paddingInline: 14, color: uiColors.brandPrimary, fontWeight: 600 }, iconWrapper: { display: "none" } } : actionChipStyles} icon={<IconAdjustmentsHorizontal size={14} />}>Filters</Chip>
            <Chip radius="xl" size="md" checked={priceFilter !== "all"} onChange={() => setPriceFilter((current) => nextOption(priceOptions, current))} styles={priceFilter !== "all" ? { label: { borderRadius: 999, background: uiColors.surface, border: `1px solid ${uiColors.brandPrimary}`, minHeight: 40, paddingInline: 14, color: uiColors.brandPrimary, fontWeight: 600 }, iconWrapper: { display: "none" } } : actionChipStyles}>{priceLabels[priceFilter]}</Chip>
            <Chip radius="xl" size="md" checked={cuisineFilter !== "all"} onChange={() => setCuisineFilter((current) => nextOption(cuisineOptions, current))} styles={cuisineFilter !== "all" ? { label: { borderRadius: 999, background: uiColors.surface, border: `1px solid ${uiColors.brandPrimary}`, minHeight: 40, paddingInline: 14, color: uiColors.brandPrimary, fontWeight: 600 }, iconWrapper: { display: "none" } } : actionChipStyles}>{cuisineLabels[cuisineFilter]}</Chip>
          </Group>
        </Box>

        <Group justify="space-between" align="center">
          <Text size="sm" c={uiColors.textSecondary}>{selectedCategory ? `${selectedCategory.label} restaurants` : "Restaurants"} <Text span fw={700} c={uiColors.textPrimary}>{filteredRestaurants.length}</Text></Text>
        </Group>

        {filteredRestaurants.map((restaurant) => {
          const availability = getRestaurantAvailabilitySummary(restaurant);

          return (
            <Link key={restaurant.slug} href={`/restaurants/${restaurant.slug}`} style={{ textDecoration: "none" }}>
              <Card radius="lg" p={0} style={{ border: `1px solid ${uiColors.border}`, background: uiColors.surface, boxShadow: "none", overflow: "hidden" }}>
                <Group gap={0} wrap="nowrap" align="stretch">
                  <Box w={96} miw={96} style={{ background: `repeating-linear-gradient(135deg, ${restaurant.heroAccent} 0 8px, #ffffff 8px 16px)`, display: "flex", alignItems: "center", justifyContent: "center", color: uiColors.textSecondary, fontWeight: 700, fontSize: 12 }}>
                    IMAGE
                  </Box>
                  <Stack gap={6} p="md" style={{ flex: 1 }}>
                    <Title order={3} size="h4" fw={700} c={uiColors.textPrimary}>{restaurant.name}</Title>
                    <Text size="sm" c={uiColors.textSecondary}>{restaurant.cuisineLabel}</Text>
                    <Group gap={6}>
                      <IconStarFilled size={14} color={uiColors.brandOrange} />
                      <Text size="sm" c={uiColors.textPrimary}>{restaurant.rating.toFixed(1)}<Text span c={uiColors.textSecondary}> · {restaurant.area}</Text></Text>
                    </Group>
                    <Group gap={6} align="flex-start" wrap="nowrap">
                      <IconClock size={14} color={uiColors.brandPrimary} style={{ marginTop: 2, flexShrink: 0 }} />
                      <Stack gap={0}>
                        <Text size="sm" fw={700} c={uiColors.brandPrimary}>{availability.label}</Text>
                        <Text size="xs" c={uiColors.textSecondary}>{availability.hint}</Text>
                      </Stack>
                    </Group>
                  </Stack>
                </Group>
              </Card>
            </Link>
          );
        })}
      </MobileShell>

      <Drawer opened={filtersOpened} onClose={() => setFiltersOpened(false)} position="right" size="78%" title={<Text fw={800}>Filters</Text>} classNames={{ content: "hide-scrollbar", body: "hide-scrollbar" }} styles={{ content: { width: "100%", maxWidth: 560, marginLeft: "auto", marginRight: "auto", right: "50%", transform: "translateX(50%)" }, body: { paddingBottom: 0, minHeight: "calc(100vh - 61px)", display: "flex", flexDirection: "column" }, header: { borderBottom: `1px solid ${uiColors.border}` } }}>
        <Stack gap="xl" style={{ flex: 1 }}>
          <Group justify="space-between" align="center"><Text fw={700} size="xl">Filters</Text><Button variant="subtle" color="gray" onClick={resetFilters}>Reset</Button></Group>
          <Stack gap="md"><Text fw={700} size="lg">Price range</Text><Group gap="sm">{priceOptions.map((item) => <Chip key={item} checked={priceFilter === item} onChange={() => setPriceFilter(item)} styles={filterChipStyles(priceFilter === item)}>{priceOptionLabels[item]}</Chip>)}</Group></Stack>
          <Box style={{ borderTop: `1px solid ${uiColors.border}`, paddingTop: 24 }}><Stack gap="md"><Text fw={700} size="lg">Cuisine</Text><Group gap="sm">{cuisineOptions.filter((item) => item !== "all").map((item) => <Chip key={item} checked={cuisineFilter === item} onChange={() => setCuisineFilter(cuisineFilter === item ? "all" : item)} styles={filterChipStyles(cuisineFilter === item)}>{cuisineLabels[item]}</Chip>)}</Group></Stack></Box>
          <Box style={{ borderTop: `1px solid ${uiColors.border}`, paddingTop: 24 }}><Stack gap="md"><Text fw={700} size="lg">Special benefits</Text><Group gap="sm">{benefitOptions.map((item) => { const active = selectedBenefits.includes(item); return <Chip key={item} checked={active} onChange={() => setSelectedBenefits((current) => active ? current.filter((value) => value !== item) : [...current, item])} styles={filterChipStyles(active)}>{benefitLabels[item]}</Chip>; })}</Group></Stack></Box>
        </Stack>
        <Box style={{ position: "sticky", bottom: 0, marginTop: "auto", paddingTop: 16, paddingBottom: 16, background: "rgba(255,255,255,0.98)", borderTop: `1px solid ${uiColors.border}` }}>
          <Button radius="md" fullWidth size="lg" color="oligoTeal" onClick={() => setFiltersOpened(false)}>Show {filteredRestaurants.length} restaurants</Button>
        </Box>
      </Drawer>
    </>
  );
}

export default function RestaurantsPage() {
  return (
    <Suspense fallback={<MobileShell title="Restaurant List" subtitle="Loading restaurants..."><Text>Loading...</Text></MobileShell>}>
      <RestaurantsContent />
    </Suspense>
  );
}
