"use client";

import { ActionIcon, Badge, Box, Group, Stack, Text, TextInput, UnstyledButton } from "@mantine/core";
import { IconBell, IconChevronDown, IconMapPinFilled, IconSearch } from "@tabler/icons-react";
import { uiColors } from "@/theme";

type HomeHeaderProps = {
  location: string;
  onOpenLocation: () => void;
};

export function HomeHeader({ location, onOpenLocation }: HomeHeaderProps) {
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
          style={{
            background: "#f7f7f4",
            color: "#556562",
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
          color="oligoTeal"
          styles={{ root: { background: "#f3f7f6", color: "#436761" } }}
        >
          Current location
        </Badge>
      </Group>

      <TextInput
        radius="md"
        size="md"
        placeholder="Search restaurants or cities"
        leftSection={<IconSearch size={16} />}
        styles={{
          input: {
            border: `1px solid ${uiColors.border}`,
            background: uiColors.surface,
            height: 52,
            color: "#22312d",
            boxShadow: "none",
          },
          section: { color: "#7f8a85" },
        }}
      />
    </Stack>
  );
}
