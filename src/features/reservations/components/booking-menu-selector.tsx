"use client";

import {
  ActionIcon,
  Button,
  Card,
  Drawer,
  Group,
  NumberFormatter,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
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
  const [opened, { open, close }] = useDisclosure(false);
  const selectedItems = categories.flatMap((category) =>
    category.items
      .filter((item) => (quantities[item.id] ?? 0) > 0)
      .map((item) => ({ ...item, quantity: quantities[item.id] })),
  );
  const selectedCount = selectedItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <>
      <Card radius="md" p="md" withBorder>
        <Stack gap="sm">
          <Group justify="space-between" wrap="nowrap" align="flex-start">
            <Stack gap={2} style={{ minWidth: 0 }}>
              <Text fw={700}>{t("title")}</Text>
              <Text size="sm" c="dimmed">
                {t("selectedCount", { count: selectedCount })}
              </Text>
            </Stack>
            <Button variant="light" color="warmCoral" onClick={open}>
              {selectedCount > 0 ? t("edit") : t("choose")}
            </Button>
          </Group>
          {selectedItems.length > 0 ? (
            <Stack gap={4}>
              {selectedItems.map((item) => (
                <Group key={item.id} justify="space-between" wrap="nowrap">
                  <Text size="sm">{item.name}</Text>
                  <Text size="sm" fw={700}>
                    x{item.quantity}
                  </Text>
                </Group>
              ))}
            </Stack>
          ) : null}
        </Stack>
      </Card>

      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size="100%"
        title={<Text fw={800}>{t("title")}</Text>}
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
          body: { paddingBottom: 0 },
          header: { borderBottom: `1px solid ${uiColors.border}` },
        }}
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {t("description")}
          </Text>
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
                          aria-label={t("quantity", {
                            item: item.name,
                            quantity,
                          })}
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
          <div
            style={{
              position: "sticky",
              bottom: 0,
              paddingBlock: 16,
              background: uiColors.surface,
              borderTop: `1px solid ${uiColors.border}`,
            }}
          >
            <Button fullWidth size="md" color="warmCoral" onClick={close}>
              {t("done", { count: selectedCount })}
            </Button>
          </div>
        </Stack>
      </Drawer>
    </>
  );
}
