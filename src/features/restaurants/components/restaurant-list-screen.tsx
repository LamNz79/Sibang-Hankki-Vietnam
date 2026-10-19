"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
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
  IconMapPin,
  IconSearch,
} from "@tabler/icons-react";
import { BottomNav, MobileShell } from "@/components/layout/customer";
import { categories } from "@/features/home/data/home-data";
import {
  type BenefitKey,
  type CuisineKey,
} from "@/features/restaurants/data/mock-data";
import type { RestaurantSummary } from "@/features/restaurants/data/api";
import {
  cityLabels,
  matchesCitySlug,
  normalizeCitySlug,
} from "@/features/restaurants/domain/city";
import {
  getFirstLiveTime,
  getLiveAvailabilityState,
  type RestaurantAvailabilityMap,
} from "@/features/restaurants/domain/live-availability";
import { uiColors } from "@/theme";

type SortKey = "recommended" | "earliest";
type PriceKey = "all" | "under150" | "under300" | "over300";

const sortOptions: SortKey[] = ["recommended", "earliest"];
const priceOptions: PriceKey[] = ["all", "under150", "under300", "over300"];
const cuisineOptions: (CuisineKey | "all")[] = ["all", "korean", "chinese", "vietnamese", "japanese", "western"];
const benefitOptions: BenefitKey[] = ["special_deal", "available", "date_night", "michelin"];
const restaurantLogos: Record<string, string> = {
  "anan-saigon": "/images/restaurant-logos/anan-saigon.jpg",
  refinery: "/images/restaurant-logos/refinery.jpg",
  "mori-teppan": "/images/restaurant-logos/mori-teppan.jpg",
  "hanoi-hearth": "/images/restaurant-logos/hanoi-hearth.jpg",
};

const actionChipStyles = { label: { borderRadius: 999, background: uiColors.surface, border: `1px solid ${uiColors.borderStrong}`, minHeight: 40, paddingInline: 14, color: uiColors.textPrimary, fontWeight: 500 }, iconWrapper: { display: "none" } };
function nextOption<T>(list: readonly T[], current: T): T { const i = list.indexOf(current); return list[(i + 1) % list.length]; }
function isOption<T extends string>(options: readonly T[], value: string | null): value is T {
  return value !== null && (options as readonly string[]).includes(value);
}
function filterChipStyles(active: boolean) { return active ? { label: { borderRadius: 10, background: uiColors.brandPrimarySoft, border: `1px solid ${uiColors.brandPrimary}`, minHeight: 42, color: uiColors.brandPrimary, fontWeight: 600 }, iconWrapper: { display: "none" } } : { label: { borderRadius: 10, background: uiColors.surface, border: `1px solid ${uiColors.border}`, minHeight: 42, color: uiColors.textPrimary, fontWeight: 500 }, iconWrapper: { display: "none" } }; }

function RestaurantsContent({ restaurants, availability }: { restaurants: RestaurantSummary[]; availability: RestaurantAvailabilityMap }) {
  const t = useTranslations("RestaurantDiscovery");
  const availabilityT = useTranslations("RestaurantAvailability");
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category") ?? undefined;
  const citySlug = searchParams.get("city") ?? undefined;
  const locationScope = searchParams.get("location") ?? undefined;
  const selectedCategory = categories.find((item) => item.slug === categorySlug);
  const selectedCity = citySlug
    ? cityLabels[normalizeCitySlug(citySlug)]
    : undefined;
  const searchScope = selectedCity ?? locationScope ?? t("hoChiMinhCity");
  const pageTitle = selectedCategory
    ? t("categoryTitle", { category: selectedCategory.label, location: searchScope })
    : selectedCity
      ? t("cityTitle", { city: selectedCity })
      : t("title");
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

  const filteredRestaurants = (() => {
    let list = restaurants.filter((restaurant) => {
      const haystack = `${restaurant.name} ${restaurant.area} ${restaurant.cuisineLabel}`.toLowerCase();
      const matchesQuery = query.trim().length === 0 || haystack.includes(query.trim().toLowerCase());
      const matchesCity =
        !citySlug || matchesCitySlug(restaurant.citySlug, citySlug);
      const matchesPrice = priceFilter === "all" || restaurant.priceKey === priceFilter;
      const matchesCuisine = cuisineFilter === "all" || restaurant.cuisineKey === cuisineFilter;
      const matchesBenefits = selectedBenefits.length === 0 || selectedBenefits.every((benefit) =>
        benefit === "available"
          ? Boolean(getFirstLiveTime(availability[restaurant.slug]))
          : restaurant.benefits.includes(benefit));
      return matchesQuery && matchesCity && matchesPrice && matchesCuisine && matchesBenefits;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "earliest") {
        return (getFirstLiveTime(availability[a.slug]) ?? "99:99").localeCompare(
          getFirstLiveTime(availability[b.slug]) ?? "99:99",
        );
      }
      return a.name.localeCompare(b.name);
    });

    return list;
  })();

  const resetFilters = () => {
    setPriceFilter("all");
    setCuisineFilter("all");
    setSelectedBenefits([]);
  };
  const liveAvailabilityLabel = (restaurantAvailability: RestaurantAvailabilityMap[string]) => {
    const state = getLiveAvailabilityState(restaurantAvailability);
    if (state.kind === "available") {
      return availabilityT(state.confirmationRequired
        ? "availableConfirmation"
        : "available", { time: state.time });
    }
    if (state.kind === "unavailable") {
      return availabilityT("unavailable", { count: state.partySize });
    }
    return availabilityT(state.kind);
  };

  return (
    <>
      <MobileShell title={pageTitle} subtitle={t("subtitle")} backHref="/" bottomNav={<BottomNav activePath="/restaurants" />}>
        <TextInput radius="xl" size="md" placeholder={t("searchPlaceholder")} value={query} onChange={(e) => setQuery(e.currentTarget.value)} leftSection={<IconSearch size={16} color={uiColors.textSecondary} />} styles={{ input: { border: `1px solid ${uiColors.border}`, background: uiColors.surface, height: 50, color: uiColors.textPrimary } }} />

        <Card radius="lg" p="md" style={{ background: uiColors.surfaceAlt, border: `1px solid ${uiColors.border}` }}>
          <Group wrap="nowrap" align="flex-start">
            <ThemeIcon radius="xl" size={40} variant="light" style={{ background: uiColors.brandPrimarySoft, color: uiColors.brandPrimary, flexShrink: 0 }}>
              <IconClock size={18} />
            </ThemeIcon>
            <Stack gap={2}>
              <Text fw={700} c={uiColors.textPrimary}>{t("availabilityTitle")}</Text>
              <Text size="sm" c={uiColors.textSecondary}>{t("availabilityDescription")}</Text>
            </Stack>
          </Group>
        </Card>

        <Group gap="xs" wrap="nowrap" style={{ overflowX: "auto" }} className="hide-scrollbar">
          <Chip radius="xl" size="sm" checked={Boolean(selectedCategory)} readOnly styles={{ label: { borderRadius: 10, background: uiColors.brandPrimarySoft, border: `1px solid ${uiColors.border}`, minHeight: 30, paddingInline: 10, color: uiColors.brandPrimary, fontWeight: 600 }, iconWrapper: { display: "none" } }}>{selectedCategory?.label ?? t("all")}</Chip>
          {[searchScope, t("available")].map((item) => <Chip key={item} radius="xl" size="sm" checked readOnly styles={{ label: { borderRadius: 10, background: uiColors.surfaceMuted, border: `1px solid ${uiColors.border}`, minHeight: 30, paddingInline: 10, color: uiColors.textPrimary, fontWeight: 600 }, iconWrapper: { display: "none" } }}>{item}</Chip>)}
        </Group>

        <Box style={{ position: "sticky", top: 0, zIndex: 30, marginInline: -16, marginTop: -6, paddingInline: 16, paddingTop: 10, paddingBottom: 12, background: uiColors.surfaceOverlay, backdropFilter: "blur(16px)", borderTop: `1px solid ${uiColors.surface}`, borderBottom: `1px solid ${uiColors.border}`, boxShadow: `0 10px 24px ${uiColors.shadowSoft}` }}>
          <Group gap="sm" wrap="nowrap" style={{ overflowX: "auto" }} className="hide-scrollbar">
            <Chip radius="xl" size="md" checked={sortBy !== "recommended"} onChange={() => setSortBy((current) => nextOption(sortOptions, current))} styles={sortBy !== "recommended" ? { label: { borderRadius: 999, background: uiColors.surface, border: `1px solid ${uiColors.brandPrimary}`, minHeight: 40, paddingInline: 14, color: uiColors.brandPrimary, fontWeight: 600 }, iconWrapper: { display: "none" } } : actionChipStyles} icon={<IconArrowsSort size={14} />}>{t(`sort.${sortBy}`)}</Chip>
            <Chip radius="xl" size="md" checked={filtersOpened || priceFilter !== "all" || cuisineFilter !== "all" || selectedBenefits.length > 0} onChange={() => setFiltersOpened(true)} styles={filtersOpened || priceFilter !== "all" || cuisineFilter !== "all" || selectedBenefits.length > 0 ? { label: { borderRadius: 999, background: uiColors.surface, border: `1px solid ${uiColors.brandPrimary}`, minHeight: 40, paddingInline: 14, color: uiColors.brandPrimary, fontWeight: 600 }, iconWrapper: { display: "none" } } : actionChipStyles} icon={<IconAdjustmentsHorizontal size={14} />}>{t("filters")}</Chip>
            <Chip radius="xl" size="md" checked={priceFilter !== "all"} onChange={() => setPriceFilter((current) => nextOption(priceOptions, current))} styles={priceFilter !== "all" ? { label: { borderRadius: 999, background: uiColors.surface, border: `1px solid ${uiColors.brandPrimary}`, minHeight: 40, paddingInline: 14, color: uiColors.brandPrimary, fontWeight: 600 }, iconWrapper: { display: "none" } } : actionChipStyles}>{t(`price.${priceFilter}`)}</Chip>
            <Chip radius="xl" size="md" checked={cuisineFilter !== "all"} onChange={() => setCuisineFilter((current) => nextOption(cuisineOptions, current))} styles={cuisineFilter !== "all" ? { label: { borderRadius: 999, background: uiColors.surface, border: `1px solid ${uiColors.brandPrimary}`, minHeight: 40, paddingInline: 14, color: uiColors.brandPrimary, fontWeight: 600 }, iconWrapper: { display: "none" } } : actionChipStyles}>{t(`cuisine.${cuisineFilter}`)}</Chip>
          </Group>
        </Box>

        <Group justify="space-between" align="center">
          <Text size="sm" c={uiColors.textSecondary}>{selectedCategory ? t("categoryResults", { category: selectedCategory.label }) : t("restaurants")} <Text span fw={700} c={uiColors.textPrimary}>{filteredRestaurants.length}</Text></Text>
        </Group>

        {filteredRestaurants.map((restaurant) => {
          const logoUrl = restaurantLogos[restaurant.slug];
          const cardImageUrl = logoUrl ?? restaurant.imageUrl;
          return (
            <Link key={restaurant.slug} href={`/restaurants/${restaurant.slug}`} style={{ textDecoration: "none" }}>
              <Card radius="lg" p={0} style={{ border: `1px solid ${uiColors.border}`, background: uiColors.surface, boxShadow: "none", overflow: "hidden" }}>
                <Group gap={0} wrap="nowrap" align="stretch">
                  <Box
                    w={96}
                    miw={96}
                    role="img"
                    aria-label={t("imageAlt", { name: restaurant.name })}
                    style={{
                      backgroundColor: restaurant.heroAccent,
                      backgroundImage: cardImageUrl ? `url("${cardImageUrl}")` : undefined,
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: logoUrl ? "contain" : "cover",
                      display: "grid",
                      placeItems: "center",
                      color: uiColors.textSecondary,
                      fontSize: 28,
                      fontWeight: 800,
                    }}
                  >
                    {cardImageUrl ? null : restaurant.name.charAt(0)}
                  </Box>
                  <Stack gap={6} p="md" style={{ flex: 1 }}>
                    <Title order={3} size="h4" fw={700} c={uiColors.textPrimary}>{restaurant.name}</Title>
                    <Text size="sm" c={uiColors.textSecondary}>{restaurant.cuisineLabel}</Text>
                    <Group gap={6}>
                      <IconMapPin size={14} color={uiColors.textSecondary} />
                      <Text size="sm" c={uiColors.textSecondary}>{restaurant.area}</Text>
                    </Group>
                    <Group gap={6} align="flex-start" wrap="nowrap">
                      <IconClock size={14} color={uiColors.brandPrimary} style={{ marginTop: 2, flexShrink: 0 }} />
                      <Stack gap={0}>
                        <Text size="sm" fw={700} c={uiColors.brandPrimary}>{liveAvailabilityLabel(availability[restaurant.slug])}</Text>
                        <Text size="xs" c={uiColors.textSecondary}>{t("cardAvailabilityHint")}</Text>
                      </Stack>
                    </Group>
                  </Stack>
                </Group>
              </Card>
            </Link>
          );
        })}
      </MobileShell>

      <Drawer opened={filtersOpened} onClose={() => setFiltersOpened(false)} position="right" size="78%" title={<Text fw={800}>{t("filters")}</Text>} classNames={{ content: "hide-scrollbar", body: "hide-scrollbar" }} styles={{ content: { width: "100%", maxWidth: 560, marginLeft: "auto", marginRight: "auto", right: "50%", transform: "translateX(50%)" }, body: { paddingBottom: 0, minHeight: "calc(100vh - 61px)", display: "flex", flexDirection: "column" }, header: { borderBottom: `1px solid ${uiColors.border}` } }}>
        <Stack gap="xl" style={{ flex: 1 }}>
          <Group justify="space-between" align="center"><Text fw={700} size="xl">{t("filters")}</Text><Button variant="subtle" color="gray" onClick={resetFilters}>{t("reset")}</Button></Group>
          <Stack gap="md"><Text fw={700} size="lg">{t("priceRange")}</Text><Group gap="sm">{priceOptions.map((item) => <Chip key={item} checked={priceFilter === item} onChange={() => setPriceFilter(item)} styles={filterChipStyles(priceFilter === item)}>{t(`priceOptions.${item}`)}</Chip>)}</Group></Stack>
          <Box style={{ borderTop: `1px solid ${uiColors.border}`, paddingTop: 24 }}><Stack gap="md"><Text fw={700} size="lg">{t("cuisineTitle")}</Text><Group gap="sm">{cuisineOptions.filter((item) => item !== "all").map((item) => <Chip key={item} checked={cuisineFilter === item} onChange={() => setCuisineFilter(cuisineFilter === item ? "all" : item)} styles={filterChipStyles(cuisineFilter === item)}>{t(`cuisine.${item}`)}</Chip>)}</Group></Stack></Box>
          <Box style={{ borderTop: `1px solid ${uiColors.border}`, paddingTop: 24 }}><Stack gap="md"><Text fw={700} size="lg">{t("benefitsTitle")}</Text><Group gap="sm">{benefitOptions.map((item) => { const active = selectedBenefits.includes(item); return <Chip key={item} checked={active} onChange={() => setSelectedBenefits((current) => active ? current.filter((value) => value !== item) : [...current, item])} styles={filterChipStyles(active)}>{t(`benefits.${item}`)}</Chip>; })}</Group></Stack></Box>
        </Stack>
        <Box style={{ position: "sticky", bottom: 0, marginTop: "auto", paddingTop: 16, paddingBottom: 16, background: uiColors.surfaceOverlay, borderTop: `1px solid ${uiColors.border}` }}>
          <Button radius="md" fullWidth size="lg" color="warmCoral" onClick={() => setFiltersOpened(false)}>{t("showResults", { count: filteredRestaurants.length })}</Button>
        </Box>
      </Drawer>
    </>
  );
}

export function RestaurantListScreen({ restaurants, availability }: { restaurants: RestaurantSummary[]; availability: RestaurantAvailabilityMap }) {
  return (
    <Suspense fallback={<MobileShell title="Restaurant List" subtitle="Loading restaurants..."><Text>Loading...</Text></MobileShell>}>
      <RestaurantsContent restaurants={restaurants} availability={availability} />
    </Suspense>
  );
}
