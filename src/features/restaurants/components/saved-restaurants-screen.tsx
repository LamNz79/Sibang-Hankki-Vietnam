"use client";

import Link from "next/link";
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconHeart, IconMapPin, IconTrash } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { BottomNav, MobileShell } from "@/components/layout/customer";
import { useSavedRestaurants } from "@/features/restaurants/hooks/use-saved-restaurants";
import { uiColors } from "@/theme";

export function SavedRestaurantsScreen() {
  const t = useTranslations("SavedRestaurants");
  const saved = useSavedRestaurants();
  const visible = saved.restaurants;

  return (
    <MobileShell
      title={t("title")}
      subtitle={t("subtitle")}
      backHref="/my"
      bottomNav={<BottomNav activePath="/my" />}
    >
      {saved.isLoading ? (
        <Group justify="center" py="xl"><Loader size="sm" /></Group>
      ) : saved.requiresLogin ? (
        <Alert color="blue" title={t("loginRequired")}>
          <Text size="sm">{t("loginDescription")}</Text>
          <Button component={Link} href="/login" variant="light" mt="sm">
            {t("login")}
          </Button>
        </Alert>
      ) : saved.isError ? (
        <Alert color="red" title={t("loadError")}>
          <Button variant="light" mt="sm" onClick={() => saved.retry()}>
            {t("retry")}
          </Button>
        </Alert>
      ) : visible.length === 0 ? (
        <Card
          radius="lg"
          p="xl"
          style={{ border: `1px solid ${uiColors.border}`, background: uiColors.surfaceAlt }}
        >
          <Stack align="center" ta="center" gap="sm">
            <ThemeIcon size={56} radius="xl" variant="light" color="warmCoral">
              <IconHeart size={27} />
            </ThemeIcon>
            <Text fw={800} size="lg">{t("emptyTitle")}</Text>
            <Text size="sm" c={uiColors.textSecondary} maw={340}>{t("emptyDescription")}</Text>
            <Button component={Link} href="/restaurants" color="warmCoral" mt="xs">
              {t("explore")}
            </Button>
          </Stack>
        </Card>
      ) : (
        <Stack gap="sm">
          <Text size="sm" c={uiColors.textSecondary}>
            {t("count", { count: visible.length })}
          </Text>
          {visible.map((restaurant) => (
            <Card
              key={restaurant.slug}
              radius="lg"
              p={0}
              style={{ border: `1px solid ${uiColors.border}`, overflow: "hidden" }}
            >
              <Group gap={0} wrap="nowrap" align="stretch">
                <Box
                  w={96}
                  miw={96}
                  style={{
                    backgroundColor: restaurant.heroAccent,
                    backgroundImage: restaurant.imageUrl
                      ? `url("${restaurant.imageUrl}")`
                      : undefined,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }}
                />
                <Stack gap={5} p="md" style={{ flex: 1, minWidth: 0 }}>
                  <Title order={2} size="h4" lineClamp={1}>{restaurant.name}</Title>
                  <Text size="sm" c={uiColors.textSecondary}>{restaurant.cuisineLabel}</Text>
                  <Group gap={5} wrap="nowrap">
                    <IconMapPin size={14} color={uiColors.textSecondary} />
                    <Text size="sm" c={uiColors.textSecondary} lineClamp={1}>
                      {restaurant.area}
                    </Text>
                  </Group>
                  <Button
                    component={Link}
                    href={`/restaurants/${restaurant.slug}`}
                    variant="light"
                    color="warmCoral"
                    size="compact-sm"
                    mt={4}
                  >
                    {t("viewDetails")}
                  </Button>
                </Stack>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  m="xs"
                  loading={saved.isToggling}
                  aria-label={t("remove", { name: restaurant.name })}
                  onClick={() => {
                    void saved.toggle(restaurant.slug).catch(() => {
                      notifications.show({ color: "red", message: t("removeError") });
                    });
                  }}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </MobileShell>
  );
}
