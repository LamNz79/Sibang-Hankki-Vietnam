import Link from "next/link";
import { Box, Group, Stack, Text } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import {
  getOwnerReservationDisplayStatus,
} from "@/features/owner/selectors/owner-reservation-selectors";
import type { OwnerReservation } from "@/features/owner/types";
import {
  GuestContextBadges,
  ReservationStatusBadge,
} from "./reservation-badges";
import { uiColors } from "@/theme";

/** Displays an actionable reservation row in the owner's daily schedule. */
export function OwnerReservationRow({
  reservation,
  compact = false,
}: {
  reservation: OwnerReservation;
  compact?: boolean;
}) {
  const displayStatus = getOwnerReservationDisplayStatus(reservation);

  return (
    <Link
      href={`/owner/reservations/${reservation.id}`}
      style={{ color: "inherit", textDecoration: "none" }}
    >
      <Group
        gap="md"
        wrap="nowrap"
        py={compact ? 12 : 14}
        style={{ borderBottom: `1px solid ${uiColors.border}` }}
      >
        <Text
          fw={800}
          size="sm"
          c={uiColors.brandPrimary}
          w={52}
          miw={52}
        >
          {reservation.time}
        </Text>

        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Group gap={8} wrap="wrap">
            <Text fw={750} c={uiColors.textPrimary}>
              {reservation.guestName}
            </Text>
            <GuestContextBadges
              tier={reservation.tier}
              preOrder={reservation.preOrder}
            />
          </Group>
          <Text size="xs" c={uiColors.textSecondary} lineClamp={1}>
            {reservation.partySize} guests
            {reservation.note ? ` · ${reservation.note}` : ""}
          </Text>
          <Box hiddenFrom="sm">
            <ReservationStatusBadge status={displayStatus} />
          </Box>
        </Stack>

        <Box visibleFrom="sm">
          <ReservationStatusBadge status={displayStatus} />
        </Box>
        <IconChevronRight size={17} color={uiColors.textMuted} />
      </Group>
    </Link>
  );
}
