"use client";

import {
  Badge,
  Box,
  Card,
  Chip,
  Drawer,
  Group,
  SimpleGrid,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { IconCheck, IconCurrentLocation } from "@tabler/icons-react";
import { useState } from "react";
import { locationGroups, popularAreas, recentAreas } from "@/components/home/home-data";

type LocationDrawerProps = {
  opened: boolean;
  onClose: () => void;
  selectedLocation: string;
  onSelectLocation: (location: string) => void;
};

export function LocationDrawer({
  opened,
  onClose,
  selectedLocation,
  onSelectLocation,
}: LocationDrawerProps) {
  const [activeCity, setActiveCity] = useState<keyof typeof locationGroups>("Ho Chi Minh");

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="78%"
      radius="24px 24px 0 0"
      padding="md"
      title={<Text fw={800}>Choose location</Text>}
      classNames={{ content: "hide-scrollbar", body: "hide-scrollbar" }}
      mx="auto"
      styles={{
        content: {
          width: "100%",
          maxWidth: 560,
          marginLeft: "auto",
          marginRight: "auto",
          left: "50%",
          transform: "translateX(-50%)",
        },
      }}
    >
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Badge
            leftSection={<IconCurrentLocation size={14} />}
            radius="xl"
            color="oligoTeal"
            variant="light"
          >
            Use current location
          </Badge>
          <Text size="sm" c="#7d7366">
            Better restaurant suggestions by area
          </Text>
        </Group>

        <Stack gap="sm">
          <Text fw={700} c="#20312c">
            Popular areas
          </Text>
          <Group gap="md" wrap="nowrap" style={{ overflowX: "auto" }} className="hide-scrollbar">
            {popularAreas.map((area, index) => (
              <Stack key={area} gap={8} align="center" style={{ minWidth: 84 }}>
                <UnstyledButton onClick={() => onSelectLocation(area)}>
                  <Box
                    w={84}
                    h={84}
                    style={{
                      borderRadius: 999,
                      background:
                        index % 2 === 0
                          ? "linear-gradient(135deg, #0a8292 0%, #007487 100%)"
                          : "linear-gradient(135deg, #d58a58 0%, #bf6e3c 100%)",
                      boxShadow: "0 10px 22px rgba(100, 71, 34, 0.12)",
                    }}
                  />
                </UnstyledButton>
                <Text ta="center" fw={600} size="sm">
                  {area}
                </Text>
              </Stack>
            ))}
          </Group>
        </Stack>

        <Stack gap="sm">
          <Text fw={700} c="#20312c">
            Recent locations
          </Text>
          <Group gap="sm">
            {recentAreas.map((area) => (
              <Chip
                key={area}
                checked={selectedLocation === area}
                onChange={() => onSelectLocation(area)}
                radius="xl"
                size="md"
                styles={{
                  label: {
                    borderRadius: 999,
                    background: selectedLocation === area ? "#007487" : "#f8f1e8",
                    color: selectedLocation === area ? "#fff" : "#23312c",
                    border: "1px solid rgba(205, 183, 151, 0.2)",
                    minHeight: 40,
                    paddingInline: 16,
                    display: "flex",
                    alignItems: "center",
                  },
                  iconWrapper: { display: "none" },
                }}
              >
                {area}
              </Chip>
            ))}
          </Group>
        </Stack>

        <SimpleGrid cols={2} spacing="md">
          <Stack gap={8}>
            <Text fw={700} c="#20312c">
              Cities
            </Text>
            {Object.keys(locationGroups).map((city) => (
              <UnstyledButton
                key={city}
                onClick={() => setActiveCity(city as keyof typeof locationGroups)}
              >
                <Card
                  radius="xl"
                  p="sm"
                  style={{
                    background: activeCity === city ? "#f2f8f8" : "#f8f1e8",
                    border:
                      activeCity === city
                        ? "1px solid rgba(0,116,135,0.26)"
                        : "1px solid rgba(205, 183, 151, 0.18)",
                  }}
                >
                  <Text fw={activeCity === city ? 700 : 500} c="#21312c">
                    {city}
                  </Text>
                </Card>
              </UnstyledButton>
            ))}
          </Stack>

          <Stack gap={8}>
            <Text fw={700} c="#20312c">
              Areas
            </Text>
            {locationGroups[activeCity].map((area) => {
              const active = selectedLocation === area;

              return (
                <UnstyledButton key={area} onClick={() => onSelectLocation(area)}>
                  <Card
                    radius="xl"
                    p="sm"
                    style={{
                      background: active ? "#fff7f2" : "#fffaf4",
                      border: active
                        ? "1px solid rgba(191,110,60,0.28)"
                        : "1px solid rgba(205, 183, 151, 0.16)",
                    }}
                  >
                    <Group justify="space-between" align="center">
                      <Text fw={active ? 700 : 500} c="#21312c">
                        {area}
                      </Text>
                      {active ? <IconCheck size={16} color="#bf6e3c" /> : null}
                    </Group>
                  </Card>
                </UnstyledButton>
              );
            })}
          </Stack>
        </SimpleGrid>
      </Stack>
    </Drawer>
  );
}
