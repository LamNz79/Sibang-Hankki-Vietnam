"use client";

import Link from "next/link";
import { ActionIcon, Box, Button, Card, Group, Image, Modal, NumberFormatter, SimpleGrid, Stack, Text, ThemeIcon, Title, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCalendarTime, IconClock, IconHeart, IconMapPin, IconPhoto } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { MobileShell } from "@/components/layout/customer";
import type { RestaurantRecord } from "@/features/restaurants/data/mock-data";
import { getLiveAvailabilityState } from "@/features/restaurants/domain/live-availability";
import { useSavedRestaurants } from "@/features/restaurants/hooks/use-saved-restaurants";
import type { RestaurantAvailability } from "@/features/reservations/data/availability";
import { uiColors } from "@/theme";

export function RestaurantDetailsScreen({
  restaurant,
  availability,
}: {
  restaurant: RestaurantRecord;
  availability: RestaurantAvailability | null;
}) {
  const t = useTranslations("RestaurantDetails");
  const availabilityT = useTranslations("RestaurantAvailability");
  const [galleryOpened, gallery] = useDisclosure(false);
  const saved = useSavedRestaurants();
  const isSaved = saved.isSaved(restaurant.slug);
  const galleryImages = restaurant.galleryImages?.length
    ? restaurant.galleryImages
    : [{ imageUrl: restaurant.imageUrl, imageAlt: restaurant.imageAlt }];
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
            aria-label={t(isSaved ? "unsave" : "save")}
            onClick={() => {
              saved.toggle(restaurant.slug);
              notifications.show({
                color: "teal",
                message: t(isSaved ? "removed" : "saved"),
              });
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
        aria-label={restaurant.imageAlt}
        style={{
          position: "relative",
          borderRadius: 24,
          backgroundColor: restaurant.heroAccent,
          backgroundImage: `url("${restaurant.imageUrl}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <Button
          variant="white"
          color="dark"
          leftSection={<IconPhoto size={16} />}
          onClick={gallery.open}
          style={{ position: "absolute", right: 16, bottom: 16 }}
        >
          {t("viewPhotos", { count: galleryImages.length })}
        </Button>
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
              alt={image.imageAlt}
              h={260}
              radius="md"
              fit="cover"
            />
          ))}
        </SimpleGrid>
      </Modal>

      <Stack gap="sm">
        <Text size="sm" fw={700} c={uiColors.textSecondary}>{restaurant.cuisineLabel} · {restaurant.district}</Text>
        <Title order={1} size="h1" c={uiColors.textPrimary}>{restaurant.name}</Title>

        <Text fw={600} c={uiColors.textPrimary}>{restaurant.priceRangeLabel}</Text>

        <Group gap="xs">
          {restaurant.tags.map((tag) => (
            <Card key={tag} radius="md" p="xs" style={{ background: uiColors.surfaceMuted, border: `1px solid ${uiColors.border}` }}>
              <Text size="xs" fw={700} c={uiColors.textPrimary}>{tag}</Text>
            </Card>
          ))}
        </Group>
      </Stack>

      <Card radius="lg" p="lg" style={{ border: `1px solid ${uiColors.border}`, background: uiColors.surface }}>
        <Stack gap="md">
          <Group gap="xs">
            <IconClock size={16} color={uiColors.textSecondary} />
            <Text c={uiColors.textPrimary}>{restaurant.openHours}</Text>
          </Group>
          <Group gap="xs">
            <IconMapPin size={16} color={uiColors.textSecondary} />
            <Text c={uiColors.textPrimary}>{restaurant.address}</Text>
          </Group>
        </Stack>
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

      <Text c={uiColors.textSecondary}>{restaurant.summary}</Text>

      {menuCategories.length > 0 && (
        <Stack gap="md">
          <Title order={2} size="h2" c={uiColors.textPrimary}>{t("menu")}</Title>
          {menuCategories.map((category) => (
            <Stack key={category.id} gap="sm">
              <Title order={3} size="h3" c={uiColors.textPrimary}>{category.name}</Title>
              {category.items.map((item) => (
                <Card
                  key={item.id}
                  radius="lg"
                  p="md"
                  style={{ border: `1px solid ${uiColors.border}`, background: uiColors.surface }}
                >
                  <Group wrap="nowrap" align="flex-start">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        w={96}
                        h={96}
                        radius="md"
                        fit="cover"
                        flex="0 0 auto"
                      />
                    )}
                    <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                      <Text fw={700} c={uiColors.textPrimary}>{item.name}</Text>
                      {item.description && (
                        <Text size="sm" c={uiColors.textSecondary}>{item.description}</Text>
                      )}
                      <Text fw={700} c={uiColors.brandPrimary} mt="auto">
                        <NumberFormatter value={item.price} thousandSeparator suffix={` ${item.currency}`} />
                      </Text>
                    </Stack>
                  </Group>
                </Card>
              ))}
            </Stack>
          ))}
        </Stack>
      )}

    </MobileShell>
  );
}
