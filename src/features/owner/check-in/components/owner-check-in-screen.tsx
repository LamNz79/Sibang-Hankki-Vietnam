"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Group,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import {
  IconCheck,
  IconInfoCircle,
  IconQrcode,
  IconSearch,
} from "@tabler/icons-react";
import { GuestContextBadges } from "@/features/owner/reservations";
import { OwnerShell } from "@/features/owner/shared";
import { ownerReservations } from "@/features/owner/data/mock-data";
import { uiColors } from "@/theme";

function OwnerCheckInContent() {
  const [mode, setMode] = useState("qr");
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("reservation");
  const reservation =
    ownerReservations.find((item) => item.id === reservationId) ??
    ownerReservations[1];

  return (
    <OwnerShell
      title="Guest check-in"
      eyebrow="QR or manual lookup"
      backHref="/owner/reservations"
      hideMobileNavigation
    >
      <Stack gap="md">
        <SegmentedControl
          fullWidth
          value={mode}
          onChange={setMode}
          color="warmCoral"
          data={[
            { value: "qr", label: "Scan QR" },
            { value: "manual", label: "Manual lookup" },
          ]}
        />

        {mode === "qr" ? (
          <Card
            radius="lg"
            p="xl"
            style={{
              minHeight: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: uiColors.brandPrimarySoft,
              border: `1px dashed ${uiColors.brandPrimary}`,
            }}
          >
            <Stack align="center" gap="sm">
              <ThemeIcon size={58} radius="md" color="warmCoral">
                <IconQrcode size={30} />
              </ThemeIcon>
              <Text fw={800} c={uiColors.textPrimary}>
                Scan the guest reservation QR
              </Text>
              <Text size="sm" ta="center" c={uiColors.textSecondary}>
                Camera integration will be connected in a later phase.
              </Text>
            </Stack>
          </Card>
        ) : null}

        <TextInput
          size="md"
          radius="md"
          placeholder="Reservation no., guest name, or phone"
          leftSection={<IconSearch size={18} />}
        />

        <Card
          radius="lg"
          p="md"
          style={{
            background: uiColors.surface,
            border: `1px solid ${uiColors.border}`,
          }}
        >
          <Group wrap="nowrap">
            <Avatar color="warmCoral" radius="xl">
              {reservation.initials}
            </Avatar>
            <Stack gap={3} style={{ flex: 1, minWidth: 0 }}>
              <GuestContextBadges
                tier={reservation.tier}
                preOrder={reservation.preOrder}
              />
              <Text fw={750}>{reservation.guestName}</Text>
              <Text size="xs" c={uiColors.textSecondary}>
                {reservation.time} · {reservation.partySize} guests · Ref.{" "}
                {reservation.reference}
              </Text>
            </Stack>
            <Link
              href={`/owner/reservations/${reservation.id}`}
              style={{ textDecoration: "none" }}
            >
              <Button
                size="sm"
                radius="md"
                leftSection={<IconCheck size={16} />}
              >
                Check in
              </Button>
            </Link>
          </Group>
        </Card>

        <Group gap={6} align="flex-start" wrap="nowrap">
          <IconInfoCircle
            size={16}
            color={uiColors.textSecondary}
            style={{ marginTop: 2 }}
          />
          <Text size="xs" c={uiColors.textSecondary}>
            If QR scanning is unavailable, confirm the reservation details
            before checking in the guest.
          </Text>
        </Group>
      </Stack>
    </OwnerShell>
  );
}

export function OwnerCheckInScreen() {
  return (
    <Suspense
      fallback={
        <OwnerShell
          title="Guest check-in"
          eyebrow="Loading reservation..."
          backHref="/owner/reservations"
          hideMobileNavigation
        >
          <Text c={uiColors.textSecondary}>Loading check-in details...</Text>
        </OwnerShell>
      }
    >
      <OwnerCheckInContent />
    </Suspense>
  );
}
