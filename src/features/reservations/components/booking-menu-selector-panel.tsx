"use client";

import {
  ActionIcon,
  Box,
  Button,
  Card,
  Group,
  Image,
  NumberFormatter,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconChefHat, IconMinus, IconPlus, IconX } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { RestaurantMenuCategory } from "@/features/restaurants/data/types";
import { menuItemImageUrl } from "@/features/restaurants/domain/menu-images";
import { uiColors } from "@/theme";

type BookingMenuSelectorProps = {
  categories: RestaurantMenuCategory[];
  quantities: Record<string, number>;
  onChange: (itemId: string, quantity: number) => void;
};

export function BookingMenuSelector({
  categories,
  quantities,
  onChange,
}: BookingMenuSelectorProps) {
  const t = useTranslations("CustomerBooking.requests.menu");
  const [opened, setOpened] = useState(false);
  const visibleCategories = categories.filter((category) => category.items.length > 0);
  const allItems = visibleCategories.flatMap((category) => category.items);
  const selectedItems = allItems
    .filter((item) => (quantities[item.id] ?? 0) > 0)
    .map((item) => ({ ...item, quantity: quantities[item.id] }));
  const selectedCount = selectedItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const subtotal = selectedItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const currency = selectedItems[0]?.currency ?? allItems[0]?.currency ?? "";
  const previewItems = allItems
    .filter((item) => menuItemImageUrl(item))
    .slice(0, 3);

  if (allItems.length === 0) return null;

  const scrollToCategory = (categoryId: string) => {
    document
      .getElementById(`booking-menu-category-${categoryId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Card radius="lg" p={0} withBorder style={{ overflow: "hidden" }}>
        {previewItems.length > 0 ? (
          <Group gap={2} wrap="nowrap" h={104}>
            {previewItems.map((item) => (
              <Image
                key={item.id}
                src={menuItemImageUrl(item)}
                alt={item.name}
                h="100%"
                style={{ flex: 1, minWidth: 0 }}
                fit="cover"
              />
            ))}
          </Group>
        ) : null}

        <Stack gap="sm" p="md">
          <Group justify="space-between" wrap="nowrap" align="flex-start">
            <Group gap="sm" wrap="nowrap" align="flex-start">
              <ThemeIcon
                size={42}
                radius="xl"
                variant="light"
                color="warmCoral"
                style={{ flexShrink: 0 }}
              >
                <IconChefHat size={21} />
              </ThemeIcon>
              <Stack gap={2} style={{ minWidth: 0 }}>
                <Text fw={750}>{t("title")}</Text>
                <Text size="sm" c={uiColors.textSecondary}>
                  {selectedCount > 0
                    ? t("selectedCount", { count: selectedCount })
                    : t("description")}
                </Text>
              </Stack>
            </Group>
            {selectedCount > 0 ? (
              <Text fw={800} c={uiColors.brandPrimary} style={{ whiteSpace: "nowrap" }}>
                <NumberFormatter
                  value={subtotal}
                  thousandSeparator
                  suffix={` ${currency}`}
                />
              </Text>
            ) : null}
          </Group>

          {selectedItems.length > 0 ? (
            <Stack gap={5} pt="xs" style={{ borderTop: `1px solid ${uiColors.border}` }}>
              {selectedItems.map((item) => (
                <Group key={item.id} justify="space-between" wrap="nowrap">
                  <Text size="sm" lineClamp={1}>{item.name}</Text>
                  <Text size="sm" fw={750} c={uiColors.textSecondary}>
                    ×{item.quantity}
                  </Text>
                </Group>
              ))}
            </Stack>
          ) : null}

          <Button
            fullWidth
            variant={selectedCount > 0 ? "light" : "filled"}
            color="warmCoral"
            onClick={() => setOpened(true)}
          >
            {selectedCount > 0 ? t("edit") : t("choose")}
          </Button>
        </Stack>
      </Card>

      {opened ? (
        <Box
          role="presentation"
          bg="rgba(0, 0, 0, 0.46)"
          style={{ position: "fixed", inset: 0, zIndex: 300, overflow: "hidden" }}
          onClick={() => setOpened(false)}
        >
          <Box
            role="dialog"
            aria-modal="true"
            aria-label={t("title")}
            bg={uiColors.surface}
            className="hide-scrollbar"
            style={{
              width: "100%",
              maxWidth: 560,
              height: "100dvh",
              margin: "0 auto",
              overflowY: "auto",
              overscrollBehavior: "contain",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <Group
              justify="space-between"
              wrap="nowrap"
              px="md"
              py="sm"
              bg={uiColors.surface}
              style={{
                position: "sticky",
                top: 0,
                zIndex: 4,
                borderBottom: `1px solid ${uiColors.border}`,
              }}
            >
              <Stack gap={0}>
                <Text fw={800}>{t("title")}</Text>
                <Text size="xs" c={uiColors.textSecondary}>
                  {t("selectedCount", { count: selectedCount })}
                </Text>
              </Stack>
              <ActionIcon
                variant="subtle"
                color="dark"
                radius="xl"
                size="lg"
                aria-label={t("close")}
                onClick={() => setOpened(false)}
              >
                <IconX size={20} />
              </ActionIcon>
            </Group>
        <Box
          px="md"
          py="sm"
          bg={uiColors.surface}
          style={{
            position: "sticky",
            top: 61,
            zIndex: 2,
            borderBottom: `1px solid ${uiColors.border}`,
            overflowX: "auto",
          }}
          className="hide-scrollbar"
        >
          <Group gap="xs" wrap="nowrap" aria-label={t("categories")}>
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

        <Stack gap="xl" px="md" pt="lg" pb={126}>
          <Text size="sm" c={uiColors.textSecondary}>
            {t("description")}
          </Text>

          {visibleCategories.map((category) => (
            <Stack
              key={category.id}
              id={`booking-menu-category-${category.id}`}
              gap="sm"
              style={{ scrollMarginTop: 70 }}
            >
              <Group justify="space-between" align="flex-end">
                <Text fw={800} size="lg">{category.name}</Text>
                <Text size="xs" c={uiColors.textSecondary}>
                  {t("itemCount", { count: category.items.length })}
                </Text>
              </Group>

              {category.items.map((item) => {
                const quantity = quantities[item.id] ?? 0;
                const imageUrl = menuItemImageUrl(item);

                return (
                  <Card
                    key={item.id}
                    radius="lg"
                    p="sm"
                    withBorder
                    style={{
                      background: quantity > 0
                        ? uiColors.brandPrimarySoft
                        : uiColors.surface,
                      borderColor: quantity > 0
                        ? uiColors.brandPrimary
                        : uiColors.border,
                    }}
                  >
                    <Group wrap="nowrap" align="stretch" gap="sm">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.name}
                          w={104}
                          h={112}
                          radius="md"
                          fit="cover"
                          flex="0 0 auto"
                        />
                      ) : null}
                      <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                        <Text fw={750} lineClamp={2}>{item.name}</Text>
                        {item.description ? (
                          <Text size="xs" c={uiColors.textSecondary} lineClamp={2}>
                            {item.description}
                          </Text>
                        ) : null}
                        <Group justify="space-between" wrap="nowrap" mt="auto">
                          <Text size="sm" fw={800} c={uiColors.brandPrimary}>
                            <NumberFormatter
                              value={item.price}
                              thousandSeparator
                              suffix={` ${item.currency}`}
                            />
                          </Text>
                          <Group gap={6} wrap="nowrap">
                            {quantity > 0 ? (
                              <>
                                <ActionIcon
                                  variant="white"
                                  color="warmCoral"
                                  radius="xl"
                                  size="lg"
                                  aria-label={t("remove", { item: item.name })}
                                  onClick={() => onChange(item.id, quantity - 1)}
                                >
                                  <IconMinus size={16} />
                                </ActionIcon>
                                <Text
                                  fw={800}
                                  ta="center"
                                  miw={20}
                                  aria-label={t("quantity", {
                                    item: item.name,
                                    quantity,
                                  })}
                                >
                                  {quantity}
                                </Text>
                              </>
                            ) : null}
                            <ActionIcon
                              variant="filled"
                              color="warmCoral"
                              radius="xl"
                              size="lg"
                              disabled={quantity >= 20}
                              aria-label={t("add", { item: item.name })}
                              onClick={() => onChange(item.id, quantity + 1)}
                            >
                              <IconPlus size={17} />
                            </ActionIcon>
                          </Group>
                        </Group>
                      </Stack>
                    </Group>
                  </Card>
                );
              })}
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
          <Group justify="space-between" mb="xs">
            <Text size="sm" c={uiColors.textSecondary}>
              {t("selectedCount", { count: selectedCount })}
            </Text>
            <Stack gap={0} align="flex-end">
              <Text size="xs" c={uiColors.textSecondary}>{t("subtotal")}</Text>
              <Text fw={800} c={uiColors.brandPrimary}>
                <NumberFormatter
                  value={subtotal}
                  thousandSeparator
                  suffix={` ${currency}`}
                />
              </Text>
            </Stack>
          </Group>
          <Button
            fullWidth
            size="md"
            color="warmCoral"
            onClick={() => setOpened(false)}
          >
            {t("done", { count: selectedCount })}
          </Button>
        </Box>
          </Box>
        </Box>
      ) : null}
    </>
  );
}
