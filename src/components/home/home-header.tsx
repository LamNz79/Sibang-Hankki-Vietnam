"use client";

import {
  ActionIcon,
  Badge,
  Group,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { IconBell, IconChevronDown, IconMapPinFilled, IconSearch } from "@tabler/icons-react";

type HomeHeaderProps = {
  location: string;
  onOpenLocation: () => void;
};

export function HomeHeader({ location, onOpenLocation }: HomeHeaderProps) {
  return (
    <Stack gap={14}>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={6}>
          <UnstyledButton onClick={onOpenLocation}>
            <Group gap={6} wrap="nowrap">
              <IconMapPinFilled size={18} color="#0a8292" />
              <Text fw={800} size="xl" c="#1f2c2a">
                {location}
              </Text>
              <IconChevronDown size={18} color="#5f6c67" />
            </Group>
          </UnstyledButton>

          <Badge
            radius="xl"
            color="oligoOrange"
            variant="light"
            w="fit-content"
            styles={{ root: { color: "#9b562b", background: "#fbefe8" } }}
          >
            Current location
          </Badge>
        </Stack>

        <ActionIcon
          variant="light"
          color="oligoOrange"
          radius="xl"
          size="xl"
          style={{ boxShadow: "0 8px 20px rgba(191, 110, 60, 0.12)" }}
        >
          <IconBell size={20} />
        </ActionIcon>
      </Group>

      <TextInput
        radius="xl"
        size="md"
        placeholder="Search restaurants, cuisines, or areas"
        leftSection={<IconSearch size={16} />}
        styles={{
          input: {
            border: "1px solid rgba(191, 110, 60, 0.14)",
            background: "rgba(255, 251, 247, 0.92)",
            height: 50,
            color: "#22312d",
            boxShadow: "0 10px 24px rgba(100, 71, 34, 0.05)",
          },
          section: { color: "#7f8a85" },
        }}
      />

      <Group gap="sm" wrap="nowrap" className="hide-scrollbar" style={{ overflowX: "auto" }}>
        <Badge radius="xl" variant="light" color="oligoTeal" styles={{ root: { height: 34, paddingInline: 14 } }}>
          Nearby now
        </Badge>
        <Badge radius="xl" variant="light" color="sand" styles={{ root: { height: 34, paddingInline: 14 } }}>
          Instant booking
        </Badge>
        <Badge radius="xl" variant="light" color="oligoOrange" styles={{ root: { height: 34, paddingInline: 14 } }}>
          Staff picks
        </Badge>
      </Group>
    </Stack>
  );
}
