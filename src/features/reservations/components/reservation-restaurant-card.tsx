import Link from "next/link";
import { Box, Card, Group, Stack, Text } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import type { CustomerReservation } from "@/features/reservations/types";
import { uiColors } from "@/theme";

type ReservationRestaurantCardProps = {
  reservation: CustomerReservation;
  heroAccent?: string;
};

/** Links the reservation detail to its restaurant profile. */
export function ReservationRestaurantCard({
  reservation,
  heroAccent,
}: ReservationRestaurantCardProps) {
  return (
    <Card
      component={Link}
      href={`/restaurants/${reservation.restaurantSlug}`}
      radius="lg"
      p="sm"
      style={{
        color: "inherit",
        textDecoration: "none",
        border: `1px solid ${uiColors.border}`,
        background: uiColors.surface,
      }}
    >
      <Group wrap="nowrap">
        <Box
          w={64}
          h={64}
          style={{
            flexShrink: 0,
            borderRadius: 12,
            background: `repeating-linear-gradient(135deg, ${
              heroAccent ?? uiColors.brandPrimarySoft
            } 0 8px, #ffffff 8px 16px)`,
          }}
        />
        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Text fw={800} c={uiColors.textPrimary}>
            {reservation.restaurantName}
          </Text>
          <Text size="xs" c={uiColors.textSecondary}>
            {reservation.district} · {reservation.cuisineLabel}
          </Text>
        </Stack>
        <IconChevronRight size={18} color={uiColors.textMuted} />
      </Group>
    </Card>
  );
}
