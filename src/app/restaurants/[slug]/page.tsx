import Link from "next/link";
import { notFound } from "next/navigation";
import { Box, Button, Card, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCalendarTime, IconClock, IconMapPin, IconStarFilled } from "@tabler/icons-react";
import { MobileShell } from "@/components/app-shell/mobile-shell";
import { getRestaurantAvailabilitySummary, getRestaurantBySlug } from "@/features/restaurants/mock-data";
import { uiColors } from "@/theme";

export default async function RestaurantDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const restaurant = getRestaurantBySlug(slug);

  if (!restaurant) notFound();

  const availability = getRestaurantAvailabilitySummary(restaurant);

  return (
    <MobileShell
      title="Restaurant Details"
      subtitle="Restaurant profile"
      backHref="/restaurants"
      bottomNav={null}
      footerContent={
        <Link href={`/reservation?restaurant=${restaurant.slug}`} style={{ textDecoration: "none" }}>
          <Button fullWidth radius="md" size="lg" color="oligoTeal">
            Select date & time
          </Button>
        </Link>
      }
    >
      <Box
        h={280}
        style={{
          borderRadius: 24,
          background: `repeating-linear-gradient(135deg, ${restaurant.heroAccent} 0 12px, #ffffff 12px 24px)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: uiColors.textSecondary,
          fontWeight: 800,
          fontSize: 28,
        }}
      >
        PHOTO GALLERY
      </Box>

      <Stack gap="sm">
        <Text size="sm" fw={700} c={uiColors.textSecondary}>{restaurant.cuisineLabel} · {restaurant.district}</Text>
        <Title order={1} size="h1" c={uiColors.textPrimary}>{restaurant.name}</Title>

        <Group gap="xs">
          <IconStarFilled size={16} color={uiColors.brandOrange} />
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

    </MobileShell>
  );
}
