"use client";

import {
  Alert,
  Button,
  Card,
  Center,
  Drawer,
  Grid,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { IconCheck, IconRefresh } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  getLocationProvinces,
  getLocationWards,
} from "@/features/locations/data/locations";
import { uiColors } from "@/theme";

const HO_CHI_MINH_CITY_CODE = 79;

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
  const t = useTranslations("Home.location");
  const [activeProvinceCode, setActiveProvinceCode] = useState<number | null>(
    HO_CHI_MINH_CITY_CODE,
  );
  const provincesQuery = useQuery({
    queryKey: ["location-provinces"],
    queryFn: ({ signal }) => getLocationProvinces(signal),
    enabled: opened,
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  });
  const wardsQuery = useQuery({
    queryKey: ["location-wards", activeProvinceCode],
    queryFn: ({ signal }) =>
      getLocationWards(activeProvinceCode as number, signal),
    enabled: opened && activeProvinceCode !== null,
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  });

  const activeProvince = provincesQuery.data?.find(
    (province) => province.code === activeProvinceCode,
  );

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="78%"
      radius="24px 24px 0 0"
      padding="md"
      title={<Text fw={800}>{t("title")}</Text>}
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
      <Stack gap="md">
        <Text size="sm" c={uiColors.textSecondary}>{t("hint")}</Text>

        {provincesQuery.isError ? (
          <Alert color="red" title={t("loadError")}>
            <Button
              mt="sm"
              size="xs"
              variant="light"
              color="red"
              leftSection={<IconRefresh size={15} />}
              onClick={() => provincesQuery.refetch()}
            >
              {t("retry")}
            </Button>
          </Alert>
        ) : provincesQuery.isLoading ? (
          <Center h={280}><Loader /></Center>
        ) : (
          <Grid align="stretch">
            <Grid.Col span={5} style={{ display: "flex" }}>
              <Stack gap={8} style={{ flex: 1, minWidth: 0 }}>
                <Text fw={700} c={uiColors.textPrimary}>{t("provinces")}</Text>
                <ScrollArea h={360} offsetScrollbars="y" scrollbarSize={6}>
                  <Stack gap={8} pr="xs">
                    {(provincesQuery.data ?? []).map((province) => {
                      const active = province.code === activeProvinceCode;
                      return (
                        <UnstyledButton
                          key={province.code}
                          onClick={() => setActiveProvinceCode(province.code)}
                          style={{ display: "block", width: "100%" }}
                        >
                          <Card
                            p="sm"
                            radius="md"
                            style={{
                              background: active
                                ? uiColors.brandPrimarySoft
                                : uiColors.surfaceAlt,
                              border: active
                                ? `1px solid ${uiColors.brandPrimary}`
                                : `1px solid ${uiColors.borderStrong}`,
                            }}
                          >
                            <Text size="sm" fw={active ? 700 : 500}>
                              {province.name}
                            </Text>
                          </Card>
                        </UnstyledButton>
                      );
                    })}
                  </Stack>
                </ScrollArea>
              </Stack>
            </Grid.Col>

            <Grid.Col span={7}>
              <Stack gap={8}>
                <Group justify="space-between" gap="xs" wrap="nowrap">
                  <Text fw={700} c={uiColors.textPrimary}>{t("wards")}</Text>
                  {activeProvince ? (
                    <UnstyledButton onClick={() => onSelectLocation(activeProvince.name)}>
                      <Text size="xs" c={uiColors.brandPrimary} fw={700}>
                        {t("selectWholeProvince")}
                      </Text>
                    </UnstyledButton>
                  ) : null}
                </Group>

                {wardsQuery.isError ? (
                  <Alert color="red" title={t("loadError")}>
                    <Button
                      mt="sm"
                      size="xs"
                      variant="light"
                      color="red"
                      leftSection={<IconRefresh size={15} />}
                      onClick={() => wardsQuery.refetch()}
                    >
                      {t("retry")}
                    </Button>
                  </Alert>
                ) : wardsQuery.isLoading ? (
                  <Center h={360}><Loader size="sm" /></Center>
                ) : (
                  <ScrollArea h={360} offsetScrollbars="y" scrollbarSize={6}>
                    <Stack gap={8} pr="xs">
                      {(wardsQuery.data ?? []).map((ward) => {
                        const active = selectedLocation === ward.name;
                        return (
                          <UnstyledButton
                            key={ward.code}
                            onClick={() => onSelectLocation(ward.name)}
                            style={{ display: "block", width: "100%" }}
                          >
                            <Card
                              p="sm"
                              radius="md"
                              style={{
                                background: active
                                  ? uiColors.brandPrimarySoft
                                  : uiColors.surface,
                                border: active
                                  ? `1px solid ${uiColors.brandPrimary}`
                                  : `1px solid ${uiColors.borderStrong}`,
                              }}
                            >
                              <Group justify="space-between" gap="xs" wrap="nowrap">
                                <Text size="sm" fw={active ? 700 : 500}>
                                  {ward.name}
                                </Text>
                                {active ? (
                                  <IconCheck
                                    size={16}
                                    color={uiColors.brandPrimary}
                                    style={{ flexShrink: 0 }}
                                  />
                                ) : null}
                              </Group>
                            </Card>
                          </UnstyledButton>
                        );
                      })}
                      {!wardsQuery.data?.length ? (
                        <Text size="sm" c={uiColors.textSecondary} ta="center" py="xl">
                          {t("noWards")}
                        </Text>
                      ) : null}
                    </Stack>
                  </ScrollArea>
                )}
              </Stack>
            </Grid.Col>
          </Grid>
        )}
      </Stack>
    </Drawer>
  );
}
