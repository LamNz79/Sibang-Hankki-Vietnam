"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Card,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import {
  buildOwnerGuests,
  getOwnerGuestStats,
} from "@/features/owner/data/owner-guests";
import { useOwnerReservations } from "@/features/owner/hooks/use-owner-reservations";
import { OwnerShell } from "@/features/owner/shared";
import { uiColors } from "@/theme";

export function OwnerGuestsScreen() {
  const t = useTranslations("OwnerGuests");
  const [query, setQuery] = useState("");
  const { reservations, isPending, isError } = useOwnerReservations();
  const allGuests = useMemo(() => buildOwnerGuests(reservations), [reservations]);
  const stats = useMemo(() => getOwnerGuestStats(allGuests), [allGuests]);
  const guests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return allGuests;
    return allGuests.filter((guest) =>
      `${guest.name} ${guest.phone} ${guest.email ?? ""}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [allGuests, query]);

  return (
    <OwnerShell title={t("title")} eyebrow={t("eyebrow")}>
      <Stack gap="md">
        <SimpleGrid cols={3} spacing={0}>
          {[
            { value: stats.profiles, label: t("stats.profiles") },
            { value: stats.repeatGuests, label: t("stats.repeatGuests") },
            { value: `${stats.returnRate}%`, label: t("stats.returnRate") },
          ].map((stat) => (
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
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchLabel")}
          leftSection={<IconSearch size={18} />}
        />

        {isError ? <Alert color="red" title={t("loadError")} /> : null}
        {isPending ? <Loader mx="auto" /> : null}

        {!isPending && !isError ? (
          <Card
            radius="lg"
            px={{ base: "md", md: "lg" }}
            py={0}
            style={{
              background: uiColors.surface,
              border: `1px solid ${uiColors.border}`,
            }}
          >
            {guests.length ? guests.map((guest) => (
              <Group
                key={guest.id}
                wrap="nowrap"
                py="md"
                style={{ borderBottom: `1px solid ${uiColors.border}` }}
              >
                <Avatar radius="xl" color="warmCoral" variant="light">
                  {guest.initials}
                </Avatar>
                <Stack gap={3} style={{ flex: 1 }}>
                  <Text fw={750}>{guest.name}</Text>
                  <Text size="xs" c={uiColors.textSecondary}>
                    {guest.phone}{guest.email ? ` · ${guest.email}` : ""}
                  </Text>
                  <Text size="xs" c={uiColors.textSecondary}>
                    {t("history", {
                      reservations: guest.reservations,
                      visits: guest.visits,
                      noShows: guest.noShows,
                    })}
                  </Text>
                </Stack>
                <Text size="xs" c={uiColors.textMuted} ta="right">
                  {t("lastReservation")}<br />
                  {guest.lastReservation.split("-").reverse().join("/")}
                </Text>
              </Group>
            )) : (
              <Text py="xl" ta="center" c={uiColors.textSecondary}>
                {t("empty")}
              </Text>
            )}
          </Card>
        ) : null}
      </Stack>
    </OwnerShell>
  );
}
