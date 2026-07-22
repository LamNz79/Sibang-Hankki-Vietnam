"use client";

import {
  Badge,
  Box,
  Card,
  Drawer,
  Grid,
  Group,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { IconCheck, IconCurrentLocation } from "@tabler/icons-react";
import { useState } from "react";
import { locationGroups, popularAreas, recentAreas } from "@/components/home/home-data";
import { uiColors } from "@/components/ui/theme-tokens";

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
          <Group
            gap="md"
            wrap="nowrap"
            style={{
              overflowX: "auto",
              overflowY: "hidden",
              paddingBottom: 4,
              WebkitOverflowScrolling: "touch",
            }}
            className="hide-scrollbar"
          >
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
                          ? "linear-gradient(135deg, #e8f4f2 0%, #d9ece8 100%)"
                          : "linear-gradient(135deg, #f7efe9 0%, #efe2d7 100%)",
                      border:
                        selectedLocation === area
                          ? `2px solid ${uiColors.brandPrimary}`
                          : `1px solid ${uiColors.border}`,
                      boxShadow:
                        selectedLocation === area
                          ? `0 8px 18px ${uiColors.brandPrimaryShadow}`
                          : "0 6px 14px rgba(85, 101, 98, 0.06)",
                    }}
                  />
                </UnstyledButton>
                <Text
                  ta="center"
                  fw={selectedLocation === area ? 700 : 600}
                  size="sm"
                  c={selectedLocation === area ? "#005f70" : "#23312c"}
                >
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
          <ScrollArea
            offsetScrollbars="x"
            scrollbarSize={6}
            styles={{
              viewport: {
                paddingBottom: 6,
              },
              scrollbar: {
                background: "transparent",
              },
              thumb: {
                background: "#d5dfdc",
              },
            }}
          >
            <Group gap="sm" wrap="nowrap">
              {recentAreas.map((area) => {
                const active = selectedLocation === area;

                return (
                  <UnstyledButton
                    key={area}
                    onClick={() => onSelectLocation(area)}
                    style={{ minWidth: 148 }}
                  >
                    <Card
                      p="sm"
                      style={{
                        background: active ? uiColors.brandPrimarySoft : uiColors.surfaceAlt,
                        border: active
                          ? `1px solid ${uiColors.brandPrimary}`
                          : `1px solid ${uiColors.borderStrong}`,

                      }}
                    >
                      <Text fw={active ? 700 : 500} c={active ? uiColors.brandPrimary : "#21312c"}>
                        {area}
                      </Text>
                    </Card>
                  </UnstyledButton>
                );
              })}
            </Group>
          </ScrollArea>
        </Stack>

        <Grid align="stretch">
          <Grid.Col span={4} style={{ display: "flex" }}>
            <Stack gap={8} style={{ flex: 1 }}>
              <Text fw={700} c="#20312c">
                Cities
              </Text>
              <Stack
                gap={8}
                p="xs"
                h={260}
                style={{
                  background: uiColors.surfaceMuted,
                  borderRadius: 16,
                  flex: 1,
                }}
              >
                {Object.keys(locationGroups).map((city) => (
                  <UnstyledButton
                    key={city}
                    onClick={() => setActiveCity(city as keyof typeof locationGroups)}
                    style={{ display: "block", width: "100%" }}
                  >
                    <Card
                      p="sm"
                      radius="md"
                      style={{
                        width: "100%",
                        minWidth: "100%",
                        background: activeCity === city ? uiColors.brandPrimarySoft : uiColors.surfaceAlt,
                        border: activeCity === city
                          ? `1px solid ${uiColors.brandPrimary}`
                          : `1px solid ${uiColors.borderStrong}`,
                      }}
                    >
                      <Text fw={activeCity === city ? 700 : 500} c="#21312c">
                        {city}
                      </Text>
                    </Card>
                  </UnstyledButton>
                ))}
              </Stack>
            </Stack>
          </Grid.Col>
          <Grid.Col span={8}>
            <Stack gap={8}>
              <Text fw={700} c="#20312c">
                Areas
              </Text>
              <ScrollArea
                h={260}
                offsetScrollbars="y"
                scrollbarSize={6}
                styles={{
                  viewport: {
                    paddingRight: 8,
                  },
                  scrollbar: {
                    background: "transparent",
                  },
                  thumb: {
                    background: "#d5dfdc",
                  },
                }}
              >
                <Stack gap={8}>
                  {locationGroups[activeCity].map((area) => {
                    const active = selectedLocation === area;

                    return (
                      <UnstyledButton
                        key={area}
                        onClick={() => onSelectLocation(area)}
                        style={{ display: "block", width: "100%" }}
                      >
                        <Card
                          p="sm"
                          style={{
                            width: "100%",
                            background: active ? "#eef6f4" : uiColors.surface,
                            border: active
                              ? `1px solid ${uiColors.brandPrimary}`
                              : `1px solid ${uiColors.borderStrong}`,
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
              </ScrollArea>
            </Stack>

          </Grid.Col>
        </Grid>
      </Stack>
    </Drawer>
  );
}


