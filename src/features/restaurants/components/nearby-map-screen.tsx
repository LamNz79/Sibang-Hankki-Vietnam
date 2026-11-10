"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCurrentLocation,
  IconHeart,
  IconMapPin,
  IconNavigation,
  IconSearch,
  IconShare,
  IconX,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { BottomNav } from "@/components/layout/customer";
import type { RestaurantSummary } from "@/features/restaurants/data/types";
import {
  getLocationErrorKey,
  googleMapsDirectionsUrl,
  type GeoPoint,
  type LocationErrorKey,
} from "@/features/restaurants/domain/location";
import { filterMappableRestaurants } from "@/features/restaurants/domain/nearby";
import { useSavedRestaurants } from "@/features/restaurants/hooks/use-saved-restaurants";
import { uiColors } from "@/theme";

const DEFAULT_CENTER = { lat: 10.7769, lng: 106.7009 };
let mapsLibraries: Promise<[
  google.maps.MapsLibrary,
  google.maps.MarkerLibrary,
]> | null = null;

function loadGoogleMaps(apiKey: string) {
  if (!mapsLibraries) {
    setOptions({ key: apiKey, v: "weekly" });
    mapsLibraries = Promise.all([
      importLibrary("maps"),
      importLibrary("marker"),
    ]);
  }
  return mapsLibraries;
}

function markerElement(label: string, color: string) {
  const marker = document.createElement("button");
  marker.type = "button";
  marker.textContent = label.slice(0, 1).toUpperCase();
  marker.style.cssText = `width:42px;height:42px;border:3px solid white;border-radius:50% 50% 50% 8px;transform:rotate(-45deg);background:${color};color:white;font-weight:800;box-shadow:0 4px 12px rgba(0,0,0,.28);cursor:pointer`;
  const text = document.createElement("span");
  text.textContent = marker.textContent;
  text.style.cssText = "display:block;transform:rotate(45deg)";
  marker.replaceChildren(text);
  return marker;
}

export function NearbyMapScreen({ restaurants }: { restaurants: RestaurantSummary[] }) {
  const t = useTranslations("NearbyMap");
  const router = useRouter();
  const saved = useSavedRestaurants();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerClassRef = useRef<typeof google.maps.marker.AdvancedMarkerElement | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<RestaurantSummary | null>(null);
  const [userLocation, setUserLocation] = useState<GeoPoint | null>(null);
  const [locationError, setLocationError] = useState<LocationErrorKey | null>(null);
  const visibleRestaurants = useMemo(
    () => filterMappableRestaurants(restaurants, query),
    [query, restaurants],
  );
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const locateUser = () => {
    if (!("geolocation" in navigator)) {
      setLocationError("locationUnavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = { latitude: coords.latitude, longitude: coords.longitude };
        setLocationError(null);
        setUserLocation(location);
        mapRef.current?.panTo({ lat: location.latitude, lng: location.longitude });
        mapRef.current?.setZoom(14);
      },
      (error) => setLocationError(getLocationErrorKey(error.code)),
      { enableHighAccuracy: false, timeout: 20_000, maximumAge: 300_000 },
    );
  };

  useEffect(() => {
    if (!apiKey || !mapContainerRef.current) return;
    let active = true;
    void loadGoogleMaps(apiKey)
      .then(([{ Map }, { AdvancedMarkerElement }]) => {
        if (!active || !mapContainerRef.current) return;
        const first = visibleRestaurants[0];
        mapRef.current = new Map(mapContainerRef.current, {
          center: first
            ? { lat: first.latitude as number, lng: first.longitude as number }
            : DEFAULT_CENTER,
          zoom: first ? 13 : 12,
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "DEMO_MAP_ID",
          disableDefaultUI: true,
          gestureHandling: "greedy",
        });
        markerClassRef.current = AdvancedMarkerElement;
        setMapReady(true);
        locateUser();
      })
      .catch(() => active && setMapError(true));
    return () => {
      active = false;
      mapRef.current = null;
    };
  // The map is initialized once; marker updates are handled separately.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  useEffect(() => {
    const map = mapRef.current;
    const AdvancedMarkerElement = markerClassRef.current;
    if (!mapReady || !map || !AdvancedMarkerElement) return;
    const markers = visibleRestaurants.map((restaurant) => {
      const marker = new AdvancedMarkerElement({
        map,
        position: {
          lat: restaurant.latitude as number,
          lng: restaurant.longitude as number,
        },
        title: restaurant.name,
        content: markerElement(restaurant.name, uiColors.brandPrimary),
      });
      marker.addListener("click", () => setSelected(restaurant));
      return marker;
    });
    return () => markers.forEach((marker) => { marker.map = null; });
  }, [mapReady, visibleRestaurants]);

  useEffect(() => {
    const map = mapRef.current;
    const AdvancedMarkerElement = markerClassRef.current;
    if (!mapReady || !map || !AdvancedMarkerElement || !userLocation) return;
    const dot = document.createElement("div");
    dot.style.cssText = "width:22px;height:22px;border:4px solid white;border-radius:50%;background:#4285f4;box-shadow:0 2px 8px rgba(0,0,0,.35)";
    const marker = new AdvancedMarkerElement({
      map,
      position: { lat: userLocation.latitude, lng: userLocation.longitude },
      title: t("yourLocation"),
      content: dot,
      zIndex: 1000,
    });
    return () => { marker.map = null; };
  }, [mapReady, t, userLocation]);

  const shareRestaurant = async (restaurant: RestaurantSummary) => {
    const url = `${window.location.origin}/restaurants/${restaurant.slug}`;
    if (navigator.share) {
      await navigator.share({ title: restaurant.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      notifications.show({ color: "teal", message: t("linkCopied") });
    }
  };

  return (
    <Box mih="100dvh" bg={uiColors.appBackground}>
      <Box mx="auto" maw={560} h="100dvh" pos="relative" bg={uiColors.surface} style={{ overflow: "hidden" }}>
        <Box ref={mapContainerRef} pos="absolute" inset={0} aria-label={t("mapLabel")} />

        {!apiKey || mapError ? (
          <Alert pos="absolute" top={90} left={16} right={16} color="red" title={t(!apiKey ? "missingKeyTitle" : "loadErrorTitle")}>
            {t(!apiKey ? "missingKeyDescription" : "loadErrorDescription")}
          </Alert>
        ) : null}

        <Stack pos="absolute" top={16} left={16} right={16} gap="xs">
          <TextInput
            size="lg"
            radius="xl"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder={t("searchPlaceholder")}
            leftSection={<IconSearch size={20} />}
            styles={{ input: { boxShadow: `0 8px 24px ${uiColors.shadowSoft}` } }}
          />
          {locationError ? (
            <Alert color="orange" py="xs">{t(locationError)}</Alert>
          ) : null}
          {apiKey && !mapError && visibleRestaurants.length === 0 ? (
            <Alert color="blue" py="xs">
              {t(restaurants.some((restaurant) => restaurant.latitude != null && restaurant.longitude != null)
                ? "noResults"
                : "noCoordinates")}
            </Alert>
          ) : null}
        </Stack>

        <ActionIcon
          pos="absolute"
          right={20}
          bottom={selected ? 330 : 112}
          size={50}
          radius="xl"
          variant="filled"
          color="white"
          c={uiColors.textPrimary}
          aria-label={t("recenter")}
          onClick={locateUser}
          style={{ boxShadow: `0 6px 18px ${uiColors.shadowSoft}` }}
        >
          <IconCurrentLocation size={22} />
        </ActionIcon>

        {selected ? (
          <Card pos="absolute" left={16} right={16} bottom={104} radius="xl" p="md" shadow="lg">
            <Group justify="space-between" wrap="nowrap" align="flex-start">
              <Stack gap={3} style={{ minWidth: 0 }}>
                <Title order={2} size="h3" lineClamp={2}>{selected.name}</Title>
                <Text size="sm" c={uiColors.textSecondary}>{selected.cuisineLabel} · {selected.area}</Text>
              </Stack>
              <Group gap={4} wrap="nowrap">
                <ActionIcon
                  variant="light"
                  color="warmCoral"
                  aria-label={t("save")}
                  onClick={() => {
                    if (saved.requiresLogin) return router.push("/login");
                    void saved.toggle(selected.slug);
                  }}
                >
                  <IconHeart size={19} fill={saved.isSaved(selected.slug) ? "currentColor" : "none"} />
                </ActionIcon>
                <ActionIcon variant="light" color="gray" aria-label={t("share")} onClick={() => void shareRestaurant(selected)}>
                  <IconShare size={19} />
                </ActionIcon>
                <ActionIcon variant="light" color="gray" aria-label={t("close")} onClick={() => setSelected(null)}>
                  <IconX size={19} />
                </ActionIcon>
              </Group>
            </Group>

            <Box
              h={112}
              my="sm"
              role="img"
              aria-label={selected.imageAlt ?? selected.name}
              style={{
                borderRadius: 14,
                backgroundColor: selected.heroAccent,
                backgroundImage: selected.imageUrl ? `url("${selected.imageUrl}")` : undefined,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            />

            <Group grow gap="xs">
              <Button component={Link} href={`/restaurants/${selected.slug}`} variant="light" color="gray" leftSection={<IconMapPin size={17} />}>
                {t("details")}
              </Button>
              <Button component="a" href={googleMapsDirectionsUrl({ ...selected, address: selected.area })} target="_blank" rel="noreferrer" variant="light" color="warmCoral" leftSection={<IconNavigation size={17} />}>
                {t("directions")}
              </Button>
              <Button component={Link} href={`/reservation?restaurant=${selected.slug}`} color="warmCoral">
                {t("reserve")}
              </Button>
            </Group>
          </Card>
        ) : null}

        <Box pos="absolute" left={16} right={16} bottom={12}>
          <BottomNav activePath="/nearby" />
        </Box>
      </Box>
    </Box>
  );
}
