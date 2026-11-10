"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Drawer,
  Group,
  Image,
  NumberFormatter,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronRight } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type {
  RestaurantMenuCategory,
  RestaurantMenuItem,
} from "@/features/restaurants/data/types";
import { menuItemImageUrl } from "@/features/restaurants/domain/menu-images";
import { uiColors } from "@/theme";

type RestaurantMenuSectionProps = {
  categories: RestaurantMenuCategory[];
  restaurantName: string;
  restaurantSlug: string;
};

function MenuItemRow({ item }: { item: RestaurantMenuItem }) {
  const imageUrl = menuItemImageUrl(item);

  return (
    <Group wrap="nowrap" align="stretch" gap="md" py="md">
      <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
        <Text fw={750} c={uiColors.textPrimary} lineClamp={2}>
          {item.name}
        </Text>
        {item.description ? (
          <Text size="sm" c={uiColors.textSecondary} lineClamp={2}>
            {item.description}
          </Text>
        ) : null}
        <Text fw={750} c={uiColors.brandPrimary} mt="auto">
          <NumberFormatter
            value={item.price}
            thousandSeparator
            suffix={` ${item.currency}`}
          />
        </Text>
      </Stack>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={item.name}
          w={104}
          h={104}
          radius="md"
          fit="cover"
          flex="0 0 auto"
        />
      ) : null}
    </Group>
  );
}

export function RestaurantMenuSection({
  categories,
  restaurantName,
  restaurantSlug,
}: RestaurantMenuSectionProps) {
  const t = useTranslations("RestaurantDetails");
  const [opened, menu] = useDisclosure(false);
  const visibleCategories = categories.filter((category) => category.items.length > 0);
  const previewItems = visibleCategories
    .flatMap((category) => category.items)
    .slice(0, 3);
  const itemCount = visibleCategories.reduce(
    (total, category) => total + category.items.length,
    0,
  );

  if (itemCount === 0) return null;

  const scrollToCategory = (categoryId: string) => {
    document
      .getElementById(`menu-category-${categoryId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Stack gap="sm">
        <Group justify="space-between" align="flex-end">
          <Stack gap={2}>
            <Title order={2} size="h2" c={uiColors.textPrimary}>
              {t("menu")}
            </Title>
            <Text size="sm" c={uiColors.textSecondary}>
              {t("menuItemCount", { count: itemCount })}
            </Text>
          </Stack>
          <Button
            variant="subtle"
            color="warmCoral"
            rightSection={<IconChevronRight size={16} />}
            onClick={menu.open}
          >
            {t("viewFullMenu")}
          </Button>
        </Group>

        <Box
          className="hide-scrollbar"
          style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}
        >
          {previewItems.map((item) => {
            const imageUrl = menuItemImageUrl(item);

            return (
            <Box
              key={item.id}
              style={{
                width: 176,
                flex: "0 0 176px",
                overflow: "hidden",
                border: `1px solid ${uiColors.border}`,
                borderRadius: 16,
                background: uiColors.surface,
              }}
            >
              {imageUrl ? (
                <Image src={imageUrl} alt={item.name} w="100%" h={116} fit="cover" />
              ) : null}
              <Stack gap={4} p="sm" mih={imageUrl ? 112 : 148}>
                <Text fw={750} c={uiColors.textPrimary} lineClamp={2}>
                  {item.name}
                </Text>
                {item.description ? (
                  <Text size="xs" c={uiColors.textSecondary} lineClamp={2}>
                    {item.description}
                  </Text>
                ) : null}
                <Text fw={750} size="sm" c={uiColors.brandPrimary} mt="auto">
                  <NumberFormatter
                    value={item.price}
                    thousandSeparator
                    suffix={` ${item.currency}`}
                  />
                </Text>
              </Stack>
            </Box>
            );
          })}
        </Box>
      </Stack>

      <Drawer
        opened={opened}
        onClose={menu.close}
        position="right"
        size="100%"
        title={(
          <Stack gap={0}>
            <Text fw={800}>{t("menu")}</Text>
            <Text size="xs" c={uiColors.textSecondary}>{restaurantName}</Text>
          </Stack>
        )}
        classNames={{ content: "hide-scrollbar", body: "hide-scrollbar" }}
        styles={{
          content: {
            width: "100%",
            maxWidth: 560,
            marginLeft: "auto",
            marginRight: "auto",
            right: "50%",
            transform: "translateX(50%)",
          },
          body: { padding: 0 },
          header: { borderBottom: `1px solid ${uiColors.border}` },
        }}
      >
        <Box
          px="md"
          py="sm"
          bg={uiColors.surface}
          style={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            borderBottom: `1px solid ${uiColors.border}`,
            overflowX: "auto",
          }}
          className="hide-scrollbar"
        >
          <Group gap="xs" wrap="nowrap" aria-label={t("menuCategories")}>
            {visibleCategories.map((category) => (
              <Button
                key={category.id}
                variant="light"
                color="warmCoral"
                radius="xl"
                size="compact-sm"
                style={{ flexShrink: 0 }}
                onClick={() => scrollToCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </Group>
        </Box>

        <Stack gap="xl" px="md" pt="lg" pb={112}>
          {visibleCategories.map((category) => (
            <Stack
              key={category.id}
              id={`menu-category-${category.id}`}
              gap={0}
              style={{ scrollMarginTop: 70 }}
            >
              <Stack gap={2} pb="xs">
                <Title order={2} size="h3" c={uiColors.textPrimary}>
                  {category.name}
                </Title>
                <Text size="sm" c={uiColors.textSecondary}>
                  {t("menuItemCount", { count: category.items.length })}
                </Text>
              </Stack>
              {category.items.map((item, index) => (
                <Box
                  key={item.id}
                  style={index > 0 ? { borderTop: `1px solid ${uiColors.border}` } : undefined}
                >
                  <MenuItemRow item={item} />
                </Box>
              ))}
            </Stack>
          ))}
        </Stack>

        <Box
          px="md"
          py="sm"
          bg={uiColors.surface}
          style={{
            position: "sticky",
            bottom: 0,
            zIndex: 2,
            borderTop: `1px solid ${uiColors.border}`,
          }}
        >
          <Text size="xs" c={uiColors.textSecondary} ta="center" mb="xs">
            {t("menuPreorderHint")}
          </Text>
          <Button
            component={Link}
            href={`/reservation?restaurant=${restaurantSlug}`}
            fullWidth
            size="md"
            radius="md"
            color="warmCoral"
          >
            {t("selectDateTime")}
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
