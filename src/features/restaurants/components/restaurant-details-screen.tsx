"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActionIcon, Badge, Box, Button, Card, Group, Image, Modal, SimpleGrid, Stack, Text, ThemeIcon, Title, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCalendarTime, IconCash, IconClock, IconExternalLink, IconHeart, IconInfoCircle, IconMapPin, IconPhoto } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { MobileShell } from "@/components/layout/customer";
import { RestaurantMenuSection } from "@/features/restaurants/components/restaurant-menu-section";
import type { RestaurantRecord } from "@/features/restaurants/data/types";
import { googleMapsDirectionsUrl } from "@/features/restaurants/domain/google-maps";
import { getLiveAvailabilityState } from "@/features/restaurants/domain/live-availability";
import { useSavedRestaurants } from "@/features/restaurants/hooks/use-saved-restaurants";
import type { RestaurantAvailability } from "@/features/reservations/data/availability";
import { ApiError } from "@/lib/api/client";
import { uiColors } from "@/theme";

export function RestaurantDetailsScreen({
  restaurant,
  availability,
}: {
  restaurant: RestaurantRecord;
  availability: RestaurantAvailability | null;
}) {
  const t = useTranslations("RestaurantDetails");
  const router = useRouter();
  const availabilityT = useTranslations("RestaurantAvailability");
  const [galleryOpened, gallery] = useDisclosure(false);
  const saved = useSavedRestaurants();
  const isSaved = saved.isSaved(restaurant.slug);
  const galleryImages = restaurant.galleryImages.length
    ? restaurant.galleryImages
    : restaurant.imageUrl
      ? [{ imageUrl: restaurant.imageUrl, imageAlt: restaurant.imageAlt }]
      : [];
  const menuCategories = restaurant.menuCategories ?? [];
  const availabilityState = getLiveAvailabilityState(availability);
  const availabilityLabel = availabilityState.kind === "available"
    ? availabilityT(availabilityState.confirmationRequired
      ? "availableConfirmation"
      : "available", { time: availabilityState.time })
    : availabilityState.kind === "unavailable"
      ? availabilityT("unavailable", { count: availabilityState.partySize })
      : availabilityT(availabilityState.kind);

  return (
    <MobileShell
      title={t("title")}
      subtitle={t("subtitle")}
      backHref="/restaurants"
      bottomNav={null}
      headerAction={
        <Tooltip label={t(isSaved ? "unsave" : "save")}>
          <ActionIcon
            variant={isSaved ? "filled" : "light"}
            color="warmCoral"
            radius="xl"
            size={40}
            loading={saved.isToggling}
            disabled={saved.isLoading}
            aria-label={t(isSaved ? "unsave" : "save")}
            onClick={async () => {
              if (saved.requiresLogin) {
                router.push("/login");
                return;
              }
              try {
                const nowSaved = await saved.toggle(restaurant.slug);
                notifications.show({
                  color: "teal",
                  message: t(nowSaved ? "saved" : "removed"),
                });
              } catch (error) {
                if (
                  error instanceof ApiError &&
                  (error.status === 401 || error.status === 403)
                ) {
                  router.push("/login");
                  return;
                }
                notifications.show({ color: "red", message: t("saveError") });
              }
            }}
          >
            <IconHeart size={20} fill={isSaved ? "currentColor" : "none"} />
          </ActionIcon>
        </Tooltip>
      }
      footerContent={
        <Link href={`/reservation?restaurant=${restaurant.slug}`} style={{ textDecoration: "none" }}>
          <Button fullWidth radius="md" size="lg" color="warmCoral">
            {t("selectDateTime")}
          </Button>
        </Link>
      }
    >
      <Box
        h={280}
        role="group"
        aria-label={restaurant.imageAlt ?? restaurant.name}
        style={{
          position: "relative",
          borderRadius: 24,
          backgroundColor: restaurant.heroAccent,
          backgroundImage: restaurant.imageUrl
            ? `url("${restaurant.imageUrl}")`
            : undefined,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        {galleryImages.length > 0 ? (
          <Button
            variant="white"
            color="dark"
            leftSection={<IconPhoto size={16} />}
            onClick={gallery.open}
            style={{ position: "absolute", right: 16, bottom: 16 }}
          >
            {t("viewPhotos", { count: galleryImages.length })}
          </Button>
        ) : null}
      </Box>

      <Modal
        opened={galleryOpened}
        onClose={gallery.close}
        title={<Text fw={800}>{t("photosTitle", { name: restaurant.name })}</Text>}
        size="xl"
        centered
      >
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          {galleryImages.map((image, index) => (
            <Image
              key={`${image.imageUrl}-${index}`}
              src={image.imageUrl}
              alt={image.imageAlt ?? restaurant.name}
              h={260}
              radius="md"
              fit="cover"
            />
          ))}
        </SimpleGrid>
      </Modal>

      <Stack gap="sm">
        <Group gap="xs">
          <Badge variant="light" color="warmCoral" radius="xl">
            {restaurant.cuisineLabel}
          </Badge>
          <Group gap={4} wrap="nowrap">
            <IconMapPin size={14} color={uiColors.textSecondary} />
            <Text size="sm" fw={650} c={uiColors.textSecondary}>
              {restaurant.district}
            </Text>
          </Group>
        </Group>
        <Title order={1} size="h1" c={uiColors.textPrimary}>{restaurant.name}</Title>

        <Group gap="xs">
          {restaurant.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              color="gray"
              radius="xl"
              size="md"
              styles={{ label: { color: uiColors.textPrimary } }}
            >
              {tag}
            </Badge>
          ))}
        </Group>
      </Stack>

      <SimpleGrid cols={2} spacing="sm">
        <Card radius="lg" p="md" style={{ border: `1px solid ${uiColors.border}`, background: uiColors.surface }}>
          <Stack gap="sm">
            <ThemeIcon radius="xl" size={36} variant="light" color="warmCoral">
              <IconClock size={18} />
            </ThemeIcon>
            <Stack gap={2}>
              <Text size="xs" fw={700} c={uiColors.textSecondary}>{t("openHours")}</Text>
              <Text size="sm" fw={750} c={uiColors.textPrimary}>{restaurant.openHours}</Text>
            </Stack>
          </Stack>
        </Card>

        <Card radius="lg" p="md" style={{ border: `1px solid ${uiColors.border}`, background: uiColors.surface }}>
          <Stack gap="sm">
            <ThemeIcon radius="xl" size={36} variant="light" color="warmCoral">
              <IconCash size={18} />
            </ThemeIcon>
            <Stack gap={2}>
              <Text size="xs" fw={700} c={uiColors.textSecondary}>{t("priceRange")}</Text>
              <Text size="sm" fw={750} c={uiColors.textPrimary}>{restaurant.priceRangeLabel}</Text>
            </Stack>
          </Stack>
        </Card>
      </SimpleGrid>

      <Card
        component="a"
        href={googleMapsDirectionsUrl(restaurant)}
        target="_blank"
        rel="noreferrer"
        aria-label={t("directions", { name: restaurant.name })}
        radius="lg"
        p="md"
        style={{
          border: `1px solid ${uiColors.border}`,
          background: uiColors.surface,
          color: "inherit",
          textDecoration: "none",
        }}
      >
        <Group gap="sm" wrap="nowrap" align="flex-start">
          <ThemeIcon radius="xl" size={36} variant="light" color="warmCoral" style={{ flexShrink: 0 }}>
            <IconMapPin size={18} />
          </ThemeIcon>
          <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
            <Stack gap={2}>
              <Text size="xs" fw={700} c={uiColors.textSecondary}>{t("address")}</Text>
              <Text size="sm" fw={650} c={uiColors.textPrimary}>{restaurant.address}</Text>
            </Stack>
            <Group gap={5} wrap="nowrap">
              <IconExternalLink size={16} color={uiColors.brandPrimary} />
              <Text
                size="xs"
                fw={700}
                c={uiColors.brandPrimary}
                style={{ whiteSpace: "nowrap" }}
              >
                {t("openInGoogleMaps")}
              </Text>
            </Group>
          </Stack>
        </Group>
      </Card>

      <Card radius="lg" p="lg" style={{ border: `1px solid ${uiColors.border}`, background: uiColors.brandPrimarySoft }}>
        <Group gap="sm" wrap="nowrap" align="flex-start">
          <ThemeIcon radius="xl" size={38} variant="light" style={{ background: "rgba(255,255,255,0.72)", color: uiColors.brandPrimary, flexShrink: 0 }}>
            <IconCalendarTime size={18} />
          </ThemeIcon>
          <Stack gap={2}>
            <Text fw={700} c={uiColors.brandPrimary}>{availabilityLabel}</Text>
            <Text size="sm" c={uiColors.textSecondary}>{t("availabilityHint")}</Text>
          </Stack>
        </Group>
      </Card>

      <Card
        radius="lg"
        p="lg"
        style={{
          border: `1px solid ${uiColors.border}`,
          borderLeft: `4px solid ${uiColors.brandPrimary}`,
          background: `linear-gradient(135deg, ${uiColors.brandPrimarySoft}, ${uiColors.surface})`,
        }}
      >
        <Group gap="md" wrap="nowrap" align="flex-start">
          <ThemeIcon
            radius="xl"
            size={40}
            variant="light"
            color="warmCoral"
            style={{ flexShrink: 0 }}
          >
            <IconInfoCircle size={20} />
          </ThemeIcon>
          <Stack gap={6}>
            <Text fw={800} c={uiColors.textPrimary}>{t("about")}</Text>
            <Text
              size="sm"
              c={uiColors.textSecondary}
              style={{ lineHeight: 1.65 }}
            >
              {restaurant.summary}
            </Text>
          </Stack>
        </Group>
      </Card>

      <RestaurantMenuSection
        categories={menuCategories}
        restaurantName={restaurant.name}
        restaurantSlug={restaurant.slug}
      />

    </MobileShell>
  );
}
