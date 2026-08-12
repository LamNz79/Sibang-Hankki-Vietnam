import { Box, Card, Group, Stack, Text } from "@mantine/core";
import type { RestaurantRecord } from "@/features/restaurants/data/mock-data";
import { uiColors } from "@/theme";

type BookingRestaurantSummaryProps = {
  restaurant: RestaurantRecord;
};

/** Compact restaurant identity shown above the booking controls. */
export function BookingRestaurantSummary({
  restaurant,
}: BookingRestaurantSummaryProps) {
  return (
    <Card
      radius="lg"
      p="md"
      style={{
        border: `1px solid ${uiColors.border}`,
        background: uiColors.surface,
      }}
    >
      <Group wrap="nowrap">
        <Box
          w={60}
          h={60}
          style={{
            borderRadius: 12,
            background: `repeating-linear-gradient(135deg, ${restaurant.heroAccent} 0 8px, #ffffff 8px 16px)`,
          }}
        />
        <Stack gap={2}>
          <Text fw={700} c={uiColors.textPrimary}>
            {restaurant.name}
          </Text>
          <Text size="sm" c={uiColors.textSecondary}>
            {restaurant.district} · {restaurant.cuisineLabel}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}
