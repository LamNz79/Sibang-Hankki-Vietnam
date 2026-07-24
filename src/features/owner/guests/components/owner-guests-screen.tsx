"use client";

import { useMemo, useState } from "react";
import {
  Avatar,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconChevronRight, IconSearch } from "@tabler/icons-react";
import { GuestContextBadges } from "@/features/owner/reservations";
import { OwnerShell } from "@/features/owner/shared";
import { ownerGuests } from "@/features/owner/data/mock-data";
import { uiColors } from "@/theme";

const guestStats = [
  { value: "1,248", label: "Guest profiles" },
  { value: "138", label: "Regulars" },
  { value: "27%", label: "Return rate" },
];

export function OwnerGuestsScreen() {
  const [query, setQuery] = useState("");

  const guests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return ownerGuests;
    return ownerGuests.filter((guest) =>
      `${guest.name} ${guest.note}`.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  return (
    <OwnerShell title="Guest management" eyebrow="Visits and tier">
      <Stack gap="md">
        <SimpleGrid cols={3} spacing={0}>
          {guestStats.map((stat) => (
            <Card
              key={stat.label}
              radius={0}
              p="md"
              style={{
                textAlign: "center",
                background: uiColors.surface,
                border: `1px solid ${uiColors.border}`,
              }}
            >
              <Title order={2} size="h3" c={uiColors.brandPrimary}>
                {stat.value}
              </Title>
              <Text size="xs" c={uiColors.textSecondary}>
                {stat.label}
              </Text>
            </Card>
          ))}
        </SimpleGrid>

        <TextInput
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          size="md"
          radius="md"
          placeholder="Search name or note"
          leftSection={<IconSearch size={18} />}
        />

        <Card
          radius="lg"
          px={{ base: "md", md: "lg" }}
          py={0}
          style={{
            background: uiColors.surface,
            border: `1px solid ${uiColors.border}`,
          }}
        >
          {guests.map((guest) => (
            <Group
              key={guest.id}
              wrap="nowrap"
              py="md"
              style={{ borderBottom: `1px solid ${uiColors.border}` }}
            >
              <Avatar
                radius="xl"
                styles={{
                  root: {
                    background:
                      guest.tier === "vip"
                        ? uiColors.brandOrangeSoft
                        : uiColors.brandPrimarySoft,
                    color:
                      guest.tier === "vip"
                        ? uiColors.brandOrange
                        : uiColors.brandPrimary,
                    fontWeight: 800,
                  },
                }}
              >
                {guest.initials}
              </Avatar>
              <Stack gap={4} style={{ flex: 1 }}>
                <Group gap={8}>
                  <Text fw={750}>{guest.name}</Text>
                  <GuestContextBadges tier={guest.tier} />
                </Group>
                <Text size="xs" c={uiColors.textSecondary}>
                  {guest.visits === 0
                    ? "First visit scheduled"
                    : `${guest.visits} visits · ${guest.note}`}
                </Text>
              </Stack>
              <IconChevronRight size={17} color={uiColors.textMuted} />
            </Group>
          ))}
        </Card>
      </Stack>
    </OwnerShell>
  );
}
