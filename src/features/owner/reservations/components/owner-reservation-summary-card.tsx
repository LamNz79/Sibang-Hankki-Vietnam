import { Avatar, Card, Group, Stack, Text } from "@mantine/core";
import type {
  OwnerReservation,
  OwnerReservationStatus,
} from "@/features/owner/types";
import {
  GuestContextBadges,
  ReservationStatusBadge,
} from "./reservation-badges";
import { uiColors } from "@/theme";

export function OwnerReservationSummaryCard({
  reservation,
  status = reservation.status,
}: {
  reservation: OwnerReservation;
  status?: OwnerReservationStatus;
}) {
  return (
    <Card
      radius="lg"
      p="md"
      style={{
        background: uiColors.surface,
        border: `1px solid ${uiColors.border}`,
      }}
    >
      <Group wrap="nowrap">
        <Avatar
          size={64}
          radius="xl"
          styles={{
            root: {
              flexShrink: 0,
              background:
                reservation.tier === "vip"
                  ? uiColors.accentVipSurface
                  : uiColors.brandPrimarySoft,
              color:
                reservation.tier === "vip"
                  ? uiColors.accentVipText
                  : uiColors.brandPrimary,
              fontWeight: 800,
            },
          }}
        >
          {reservation.initials}
        </Avatar>

        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Group gap={6} wrap="wrap">
            <ReservationStatusBadge status={status} />
            <GuestContextBadges
              tier={reservation.tier}
              preOrder={reservation.preOrder}
            />
          </Group>
          <Text fw={800} size="lg" c={uiColors.textPrimary}>
            {reservation.guestName}
          </Text>
          <Text size="xs" c={uiColors.textSecondary}>
            {reservation.time} · {reservation.partySize} guests · Ref. {" "}
            {reservation.reference}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}
