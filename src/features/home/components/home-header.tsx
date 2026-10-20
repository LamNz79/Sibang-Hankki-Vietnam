"use client";

import { useState, type FormEvent } from "react";
import { ActionIcon, Badge, Box, Group, Stack, Text, TextInput, UnstyledButton } from "@mantine/core";
import { IconBell, IconChevronDown, IconMapPinFilled, IconSearch } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { uiColors } from "@/theme";

export type HomeHeaderProps = {
  location: string;
  onOpenLocation: () => void;
  onSearch: (query: string) => void;
};

export function HomeHeader({ location, onOpenLocation, onSearch }: HomeHeaderProps) {
  const t = useTranslations("Home.header");
  const [query, setQuery] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <Stack gap={16}>
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Text fw={800} size="32px" lh={1.1} c={uiColors.brandPrimaryStrong}>
          Sibang Hankki
        </Text>

        <ActionIcon
          variant="light"
          color="gray"
          radius="xl"
          size="xl"
          aria-label={t("notifications")}
          style={{
            background: uiColors.surfaceMuted,
            color: uiColors.textSecondary,
          }}
        >
          <IconBell size={20} />
        </ActionIcon>
      </Box>

      <Group justify="space-between" align="center">
        <UnstyledButton onClick={onOpenLocation}>
          <Group gap={6} wrap="nowrap">
            <IconMapPinFilled size={16} color={uiColors.brandPrimaryStrong} />
            <Text fw={700} size="sm" c={uiColors.textPrimary}>
              {location}
            </Text>
            <IconChevronDown size={16} color={uiColors.textSecondary} />
          </Group>
        </UnstyledButton>

        <Badge
          radius="xl"
          variant="light"
          color="warmCoral"
          styles={{
            root: {
              background: uiColors.brandPrimarySoft,
              color: uiColors.brandPrimaryStrong,
            },
          }}
        >
          {t("currentLocation")}
        </Badge>
      </Group>

      <form onSubmit={submit}>
        <TextInput
          radius="md"
          size="md"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchLabel")}
          leftSection={<IconSearch size={16} />}
          styles={{
            input: {
              border: `1px solid ${uiColors.border}`,
              background: uiColors.surface,
              height: 52,
              color: uiColors.textPrimary,
              boxShadow: "none",
            },
            section: { color: uiColors.textMuted },
          }}
        />
      </form>
    </Stack>
  );
}
