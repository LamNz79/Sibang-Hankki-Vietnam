import Link from "next/link";
import { Box, Card, Group, Stack, Text } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import type { CustomerReservation } from "@/features/reservations/types";
import { uiColors } from "@/theme";

/** Links the reservation detail to its restaurant profile. */
export function ReservationRestaurantCard({
  reservation,
}: {
  reservation: CustomerReservation;
}) {
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
          role="img"
          aria-label={reservation.restaurantImageAlt ?? reservation.restaurantName}
          style={{
            flexShrink: 0,
            borderRadius: 12,
            backgroundColor: uiColors.brandPrimarySoft,
            backgroundImage: reservation.restaurantImageUrl
              ? `url("${reservation.restaurantImageUrl}")`
              : `repeating-linear-gradient(135deg, ${uiColors.brandPrimarySoft} 0 8px, #ffffff 8px 16px)`,
            backgroundPosition: "center",
            backgroundSize: "cover",
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
