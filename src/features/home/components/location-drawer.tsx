"use client";

import {
  Alert,
  Button,
  Card,
  Center,
  Drawer,
  Group,
  Loader,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { IconCheck, IconMapPin, IconRefresh, IconSearch } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  getLocationProvinces,
  getLocationWards,
  type LocationSelection,
} from "@/features/locations/data/locations";
import { uiColors } from "@/theme";

const HO_CHI_MINH_CITY_CODE = 79;

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

type LocationDrawerProps = {
  opened: boolean;
  onClose: () => void;
  selectedLocation: LocationSelection;
  onSelectLocation: (location: LocationSelection) => void;
};

export function LocationDrawer({
  opened,
  onClose,
  selectedLocation,
  onSelectLocation,
}: LocationDrawerProps) {
  const t = useTranslations("Home.location");
  const [activeProvinceCode, setActiveProvinceCode] = useState<number>(
    HO_CHI_MINH_CITY_CODE,
  );
  const [wardSearch, setWardSearch] = useState("");
  const provincesQuery = useQuery({
    queryKey: ["location-provinces"],
    queryFn: ({ signal }) => getLocationProvinces(signal),
    enabled: opened,
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  });
  const wardsQuery = useQuery({
    queryKey: ["location-wards", activeProvinceCode],
    queryFn: ({ signal }) => getLocationWards(activeProvinceCode, signal),
    enabled: opened,
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  });

  const activeProvince = provincesQuery.data?.find(
    (province) => province.code === activeProvinceCode,
  );
  const normalizedWardSearch = normalizeSearch(wardSearch);
  const wards = (wardsQuery.data ?? []).filter(
    (ward) => ward.provinceCode === activeProvinceCode,
  );
  const filteredWards = normalizedWardSearch
    ? wards.filter((ward) =>
        normalizeSearch(ward.name).includes(normalizedWardSearch))
    : wards;

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
          <LoadError label={t("loadError")} retry={t("retry")} onRetry={() => provincesQuery.refetch()} />
        ) : provincesQuery.isLoading ? (
          <Center h={320}><Loader /></Center>
        ) : (
          <>
            <Select
              label={t("provinces")}
              placeholder={t("searchProvince")}
              leftSection={<IconMapPin size={17} />}
              value={String(activeProvinceCode)}
              data={(provincesQuery.data ?? []).map((province) => ({
                value: String(province.code),
                label: province.name,
              }))}
              onChange={(value) => {
                if (!value) return;
                setActiveProvinceCode(Number(value));
                setWardSearch("");
              }}
              searchable
              allowDeselect={false}
              nothingFoundMessage={t("nothingFound")}
              comboboxProps={{ withinPortal: true }}
              size="md"
              radius="md"
            />

            <Card
              radius="lg"
              p="md"
              style={{
                border: `1px solid ${uiColors.border}`,
                background: uiColors.surfaceAlt,
              }}
            >
              <Group justify="space-between" align="center" gap="sm" wrap="nowrap">
                <Stack gap={2} style={{ minWidth: 0 }}>
                  <Text size="xs" c={uiColors.textSecondary}>{t("wards")}</Text>
                  <Text fw={700} truncate>{activeProvince?.name}</Text>
                </Stack>
                {activeProvince ? (
                  <Button
                    variant="light"
                    color="warmCoral"
                    radius="xl"
                    size="xs"
                    onClick={() => onSelectLocation({
                      label: activeProvince.name,
                      provinceCode: activeProvince.code,
                      wardCode: null,
                    })}
                  >
                    {t("selectWholeProvince")}
                  </Button>
                ) : null}
              </Group>
            </Card>

            <TextInput
              value={wardSearch}
              onChange={(event) => setWardSearch(event.currentTarget.value)}
              placeholder={t("searchWard")}
              aria-label={t("searchWard")}
              leftSection={<IconSearch size={18} />}
              size="md"
              radius="md"
            />

            {wardsQuery.isError ? (
              <LoadError label={t("loadError")} retry={t("retry")} onRetry={() => wardsQuery.refetch()} />
            ) : wardsQuery.isFetching ? (
              <Center h={280}><Loader size="sm" /></Center>
            ) : (
              <ScrollArea
                h="clamp(300px, calc(78dvh - 220px), 480px)"
                offsetScrollbars="y"
                scrollbarSize={6}
              >
                <Stack gap={8} pr="xs">
                  {filteredWards.map((ward) => {
                    const active = selectedLocation.wardCode === ward.code;
                    return (
                      <UnstyledButton
                        key={ward.code}
                        onClick={() => onSelectLocation({
                          label: ward.name,
                          provinceCode: ward.provinceCode,
                          wardCode: ward.code,
                        })}
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
                            <Text size="sm" fw={active ? 700 : 500}>{ward.name}</Text>
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
                  {!filteredWards.length ? (
                    <Text size="sm" c={uiColors.textSecondary} ta="center" py="xl">
                      {wardSearch ? t("nothingFound") : t("noWards")}
                    </Text>
                  ) : null}
                </Stack>
              </ScrollArea>
            )}
          </>
        )}
      </Stack>
    </Drawer>
  );
}

function LoadError({
  label,
  retry,
  onRetry,
}: {
  label: string;
  retry: string;
  onRetry: () => void;
}) {
  return (
    <Alert color="red" title={label}>
      <Button
        mt="sm"
        size="xs"
        variant="light"
        color="red"
        leftSection={<IconRefresh size={15} />}
        onClick={onRetry}
      >
        {retry}
      </Button>
    </Alert>
  );
}
