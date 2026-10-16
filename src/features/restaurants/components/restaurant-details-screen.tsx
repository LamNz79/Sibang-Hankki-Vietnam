"use client";

import Link from "next/link";
import { Box, Button, Card, Group, Image, Modal, NumberFormatter, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCalendarTime, IconClock, IconMapPin, IconPhoto, IconStarFilled } from "@tabler/icons-react";
import { MobileShell } from "@/components/layout/customer";
import {
  getRestaurantAvailabilitySummary,
  type RestaurantRecord,
} from "@/features/restaurants/data/mock-data";
import { uiColors } from "@/theme";

export function RestaurantDetailsScreen({ restaurant }: { restaurant: RestaurantRecord }) {
  const availability = getRestaurantAvailabilitySummary(restaurant);
  const [galleryOpened, gallery] = useDisclosure(false);
  const galleryImages = restaurant.galleryImages?.length
    ? restaurant.galleryImages
    : [{ imageUrl: restaurant.imageUrl, imageAlt: restaurant.imageAlt }];
  const menuCategories = restaurant.menuCategories ?? [];

  return (
    <MobileShell
      title="Restaurant Details"
      subtitle="Restaurant profile"
      backHref="/restaurants"
      bottomNav={null}
      footerContent={
        <Link href={`/reservation?restaurant=${restaurant.slug}`} style={{ textDecoration: "none" }}>
          <Button fullWidth radius="md" size="lg" color="warmCoral">
            Select date & time
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
          View {galleryImages.length} {galleryImages.length === 1 ? "photo" : "photos"}
        </Button>
      </Box>

      <Modal
        opened={galleryOpened}
        onClose={gallery.close}
        title={<Text fw={800}>{restaurant.name} photos</Text>}
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

        <Group gap="xs">
          <IconStarFilled size={16} color={uiColors.rating} />
          <Text fw={600} c={uiColors.textPrimary}>{restaurant.rating.toFixed(1)} ({restaurant.ratingCount}) · {restaurant.priceRangeLabel}</Text>
        </Group>

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
            <Text fw={700} c={uiColors.brandPrimary}>{availability.label}</Text>
            <Text size="sm" c={uiColors.textSecondary}>{availability.hint}</Text>
          </Stack>
        </Group>
      </Card>

      <Text c={uiColors.textSecondary}>{restaurant.summary}</Text>

      {menuCategories.length > 0 && (
        <Stack gap="md">
          <Title order={2} size="h2" c={uiColors.textPrimary}>Menu</Title>
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
