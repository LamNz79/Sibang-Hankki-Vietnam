"use client";

import {
  ActionIcon,
  Card,
  Group,
  NumberFormatter,
  Stack,
  Text,
} from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { RestaurantMenuCategory } from "@/features/restaurants/data/mock-data";
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

  return (
    <Stack gap="sm">
      <Stack gap={2}>
        <Text fw={700}>{t("title")}</Text>
        <Text size="sm" c="dimmed">
          {t("description")}
        </Text>
      </Stack>

      {categories.map((category) => (
        <Stack key={category.id} gap="xs">
          <Text size="sm" fw={700} c={uiColors.textSecondary}>
            {category.name}
          </Text>
          {category.items.map((item) => {
            const quantity = quantities[item.id] ?? 0;

            return (
              <Card
                key={item.id}
                radius="md"
                p="sm"
                withBorder
                style={{ background: uiColors.surface }}
              >
                <Group justify="space-between" wrap="nowrap" align="center">
                  <Stack gap={2} style={{ minWidth: 0 }}>
                    <Text fw={700}>{item.name}</Text>
                    <Text size="sm" c={uiColors.brandPrimary}>
                      <NumberFormatter
                        value={item.price}
                        thousandSeparator
                        suffix={` ${item.currency}`}
                      />
                    </Text>
                  </Stack>
                  <Group gap="xs" wrap="nowrap">
                    <ActionIcon
                      variant="light"
                      color="warmCoral"
                      radius="xl"
                      disabled={quantity === 0}
                      aria-label={t("remove", { item: item.name })}
                      onClick={() => onChange(item.id, quantity - 1)}
                    >
                      <IconMinus size={16} />
                    </ActionIcon>
                    <Text
                      fw={700}
                      ta="center"
                      miw={20}
                      aria-label={t("quantity", { item: item.name, quantity })}
                    >
                      {quantity}
                    </Text>
                    <ActionIcon
                      variant="filled"
                      color="warmCoral"
                      radius="xl"
                      disabled={quantity >= 20}
                      aria-label={t("add", { item: item.name })}
                      onClick={() => onChange(item.id, quantity + 1)}
                    >
                      <IconPlus size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Card>
            );
          })}
        </Stack>
      ))}
    </Stack>
  );
}
