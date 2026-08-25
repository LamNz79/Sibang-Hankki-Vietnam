"use client";

import dayjs from "dayjs";
import {
  Box,
  Button,
  Card,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconQrcode } from "@tabler/icons-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { getUpcomingConfirmedReservations } from "@/features/reservations/domain/selectors";
import { useCustomerReservations } from "@/features/reservations/hooks/use-customer-reservations";
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

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [location, setLocation] = useState("Ho Chi Minh City");
  const [locationOpened, setLocationOpened] = useState(false);
  const [qrPickerOpened, setQrPickerOpened] = useState(false);
  const [pickedQrId, setPickedQrId] = useState<string | null>(null);
  const deepLinkedQrId = searchParams.get("qr");
  const selectedQrId = pickedQrId ?? deepLinkedQrId;
  const qrOpened = qrPickerOpened || Boolean(deepLinkedQrId);
  const reservations = useCustomerReservations();
  const confirmedReservations = getUpcomingConfirmedReservations(
    reservations,
    dayjs().format("YYYY-MM-DDTHH:mm"),
  );
  const nextConfirmedReservation = confirmedReservations[0];
  const selectedReservation = confirmedReservations.find(
    (reservation) => reservation.id === selectedQrId,
  );

  const openQr = () => {
    setPickedQrId(
      confirmedReservations.length === 1 ? nextConfirmedReservation.id : null,
    );
    setQrPickerOpened(true);
  };

  const clearQrDeepLink = () => {
    if (!deepLinkedQrId) return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete("qr");
    const query = params.toString();
    router.replace(query ? `/?${query}` : "/", { scroll: false });
  };

  const closeQr = () => {
    setQrPickerOpened(false);
    setPickedQrId(null);
    clearQrDeepLink();
  };

  const showQrList = () => {
    setPickedQrId(null);
    setQrPickerOpened(true);
    clearQrDeepLink();
  };

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

      {nextConfirmedReservation?.checkInToken ? (
        <>
          <Card
            radius="lg"
            p="md"
            style={{
              border: `1px solid ${uiColors.border}`,
              background: uiColors.statusSuccessSurface,
            }}
          >
            <Stack gap="sm">
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon color="teal" variant="light" radius="md" size={40}>
                  <IconQrcode size={21} />
                </ThemeIcon>
                <Stack gap={1} style={{ flex: 1 }}>
                  <Text fw={800} size="sm" c={uiColors.statusSuccessText}>
                    {confirmedReservations.length === 1
                      ? "Your reservation is confirmed"
                      : `You have ${confirmedReservations.length} confirmed reservations`}
                  </Text>
                  <Text size="xs" c={uiColors.textSecondary}>
                    {confirmedReservations.length === 1
                      ? `${nextConfirmedReservation.restaurantName} · ${dayjs(nextConfirmedReservation.date).format("MMM D")} · ${nextConfirmedReservation.time}`
                      : "Choose a reservation to show its check-in QR."}
                  </Text>
                </Stack>
              </Group>
              <Button
                color="teal"
                variant="light"
                fullWidth
                leftSection={<IconQrcode size={18} />}
                onClick={openQr}
              >
                {confirmedReservations.length === 1
                  ? "Show check-in QR"
                  : "View check-in QR codes"}
              </Button>
            </Stack>
          </Card>

          <Modal
            opened={qrOpened}
            onClose={closeQr}
            title={
              selectedReservation
                ? "Reservation QR code"
                : "Upcoming reservations"
            }
            centered
            radius="lg"
            size="xs"
          >
            {selectedReservation?.checkInToken ? (
              <Stack align="center" gap="md">
                <div
                  style={{
                    padding: 12,
                    background: "white",
                    borderRadius: 12,
                    lineHeight: 0,
                  }}
                >
                  <QRCodeSVG
                    value={selectedReservation.checkInToken}
                    size={200}
                    level="M"
                    title="Reservation check-in QR code"
                  />
                </div>
                <Stack gap={2} align="center">
                  <Text fw={800}>{selectedReservation.restaurantName}</Text>
                  <Text size="sm" c={uiColors.textSecondary}>
                    {dayjs(selectedReservation.date).format("dddd, MMM D")} ·{" "}
                    {selectedReservation.time} · {selectedReservation.guests}{" "}
                    {selectedReservation.guests === 1 ? "guest" : "guests"}
                  </Text>
                </Stack>
                <Button
                  component={Link}
                  href={`/reservations/${selectedReservation.id}`}
                  variant="default"
                  fullWidth
                >
                  View reservation details
                </Button>
                {confirmedReservations.length > 1 ? (
                  <Button
                    variant="subtle"
                    color="gray"
                    onClick={showQrList}
                  >
                    Back to reservations
                  </Button>
                ) : null}
              </Stack>
            ) : (
              <Stack gap="sm">
                {confirmedReservations.map((reservation) => (
                  <Card key={reservation.id} withBorder radius="md" p="sm">
                    <Group gap="sm" wrap="nowrap">
                      <Stack gap={2} style={{ flex: 1 }}>
                        <Text fw={750} size="sm">
                          {reservation.restaurantName}
                        </Text>
                        <Text size="xs" c={uiColors.textSecondary}>
                          {dayjs(reservation.date).format("ddd, MMM D")} ·{" "}
                          {reservation.time} · {reservation.guests}{" "}
                          {reservation.guests === 1 ? "guest" : "guests"}
                        </Text>
                      </Stack>
                      <Button
                        size="compact-sm"
                        variant="light"
                        color="teal"
                        onClick={() => setPickedQrId(reservation.id)}
                      >
                        Show QR
                      </Button>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Modal>
        </>
      ) : null}

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

export function HomeScreen() {
  return (
    <Suspense
      fallback={
        <MobileShell
          title="Sibang Hankki"
          subtitle="Loading reservations..."
          bottomNav={<BottomNav activePath="/" />}
        >
          <Text>Loading...</Text>
        </MobileShell>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
