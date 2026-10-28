"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  Alert,
  Button,
  Group,
  Loader,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  getLocationProvinces,
  getLocationWards,
  type SystemAdminRestaurantDetail,
  type SystemAdminRestaurantInput,
} from "@/features/system-admin/data/system-admin-directory";
import { normalizeRestaurantSlugInput } from "./restaurant-form-utils";
import { accountAccentColor, useAccountPreferences } from "./account-preferences-context";

const emptyRestaurant: SystemAdminRestaurantInput = {
  slug: "",
  name: "",
  description: "",
  cuisineType: "",
  cuisineLabel: "",
  provinceCode: null,
  wardCode: null,
  address: "",
  phone: "",
  email: "",
  timezone: "Asia/Ho_Chi_Minh",
  priceRange: "",
};

const cuisineLabels: Record<string, string> = {
  vietnamese: "Vietnamese",
  korean: "Korean",
  chinese: "Chinese",
  japanese: "Japanese",
  western: "Western",
};

const timezoneValues = [
  "Asia/Ho_Chi_Minh",
  "Asia/Seoul",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Asia/Bangkok",
] as const;

function toInput(restaurant: SystemAdminRestaurantDetail | null) {
  if (!restaurant) return emptyRestaurant;
  return {
    slug: restaurant.slug,
    name: restaurant.name,
    description: restaurant.description ?? "",
    cuisineType: restaurant.cuisineType ?? "",
    cuisineLabel: restaurant.cuisineLabel ?? "",
    provinceCode: restaurant.provinceCode,
    wardCode: restaurant.wardCode,
    address: restaurant.address ?? "",
    phone: restaurant.phone ?? "",
    email: restaurant.email ?? "",
    timezone: restaurant.timezone,
    priceRange: restaurant.priceRange ?? "",
  };
}

type Props = {
  opened: boolean;
  restaurant: SystemAdminRestaurantDetail | null;
  editing: boolean;
  loading: boolean;
  loadError: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: SystemAdminRestaurantInput) => void;
};

export function RestaurantFormDialog({
  opened,
  restaurant,
  editing,
  loading,
  loadError,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const t = useTranslations("SystemAdmin.restaurants.form");
  const preferences = useAccountPreferences();
  const accentColor = accountAccentColor(preferences.themeColor);
  const [input, setInput] = useState<SystemAdminRestaurantInput>(() =>
    toInput(restaurant));
  const provincesQuery = useQuery({
    queryKey: ["location-provinces"],
    queryFn: ({ signal }) => getLocationProvinces(signal),
    enabled: opened,
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  });
  const wardsQuery = useQuery({
    queryKey: ["location-wards", input.provinceCode],
    queryFn: ({ signal }) => getLocationWards(input.provinceCode as number, signal),
    enabled: opened && input.provinceCode !== null,
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  });
  const change = (field: keyof SystemAdminRestaurantInput) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.currentTarget.value;
      setInput((current) => ({ ...current, [field]: value }));
    };
  const changeSlug = (event: ChangeEvent<HTMLInputElement>) => {
    const slug = normalizeRestaurantSlugInput(event.currentTarget.value);
    setInput((current) => ({ ...current, slug }));
  };
  const changeCuisine = (value: string | null) =>
    setInput((current) => ({
      ...current,
      cuisineType: value ?? "",
      cuisineLabel: value ? cuisineLabels[value] : "",
    }));
  const changeProvince = (value: string | null) =>
    setInput((current) => ({
      ...current,
      provinceCode: value ? Number(value) : null,
      wardCode: null,
    }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(input);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editing ? t("editTitle") : t("createTitle")}
      size="lg"
      centered
      closeOnClickOutside={!saving}
      closeOnEscape={!saving}
    >
      {loading ? <Group justify="center" py="xl"><Loader /></Group> : null}
      {loadError ? <Alert color="red" title={t("loadError")} /> : null}
      {!loading && !loadError ? (
        <form onSubmit={submit}>
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput
                label={t("slug")}
                placeholder={t("placeholders.slug")}
                value={input.slug ?? ""}
                onChange={changeSlug}
                onBlur={() => setInput((current) => ({
                  ...current,
                  slug: current.slug?.replace(/-+$/, "") ?? "",
                }))}
                disabled={editing}
                required
                maxLength={160}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              />
              <TextInput
                label={t("name")}
                placeholder={t("placeholders.name")}
                value={input.name}
                onChange={change("name")}
                required
                maxLength={200}
              />
              <Select
                label={t("province")}
                placeholder={t("selectProvince")}
                value={input.provinceCode === null ? null : String(input.provinceCode)}
                onChange={changeProvince}
                data={(provincesQuery.data ?? []).map((province) => ({
                  value: String(province.code),
                  label: province.name,
                }))}
                searchable
                required
                disabled={provincesQuery.isLoading}
              />
              <Select
                label={t("ward")}
                placeholder={input.provinceCode === null
                  ? t("selectProvinceFirst")
                  : t("selectWard")}
                value={input.wardCode === null ? null : String(input.wardCode)}
                onChange={(value) => setInput((current) => ({
                  ...current,
                  wardCode: value ? Number(value) : null,
                }))}
                data={(wardsQuery.data ?? []).map((ward) => ({
                  value: String(ward.code),
                  label: ward.name,
                }))}
                searchable
                required
                disabled={input.provinceCode === null || wardsQuery.isLoading}
              />
              <Select
                label={t("cuisine")}
                placeholder={t("selectCuisine")}
                value={input.cuisineType || null}
                onChange={changeCuisine}
                data={Object.keys(cuisineLabels).map((value) => ({
                  value,
                  label: t(`cuisines.${value}`),
                }))}
                clearable
              />
              <Select
                label={t("timezone")}
                description={t("timezoneHelp")}
                placeholder={t("selectTimezone")}
                value={input.timezone}
                onChange={(value) => setInput((current) => ({
                  ...current,
                  timezone: value ?? current.timezone,
                }))}
                data={timezoneValues.map((value) => ({
                  value,
                  label: t(`timezones.${value.replaceAll("/", ".")}`),
                }))}
                searchable
                allowDeselect={false}
                nothingFoundMessage={t("timezoneNotFound")}
                required
              />
              <TextInput
                label={t("phone")}
                placeholder={t("placeholders.phone")}
                value={input.phone}
                onChange={change("phone")}
                maxLength={30}
              />
              <TextInput
                label={t("email")}
                type="email"
                placeholder={t("placeholders.email")}
                value={input.email}
                onChange={change("email")}
                maxLength={320}
              />
              <TextInput
                label={t("priceRange")}
                placeholder={t("placeholders.priceRange")}
                value={input.priceRange}
                onChange={change("priceRange")}
                maxLength={40}
              />
            </SimpleGrid>
            {provincesQuery.isError || wardsQuery.isError ? (
              <Alert color="red" title={t("locationLoadError")} />
            ) : null}
            <Textarea
              label={t("address")}
              placeholder={t("placeholders.address")}
              value={input.address}
              onChange={change("address")}
              autosize
              minRows={2}
            />
            <Textarea
              label={t("description")}
              placeholder={t("placeholders.description")}
              value={input.description}
              onChange={change("description")}
              autosize
              minRows={3}
            />
            <Group justify="flex-end">
              <Button
                variant="default" onClick={onClose} disabled={saving}>
                {t("cancel")}
              </Button>
              <Button
                color={accentColor}
                autoContrast
                type="submit"
                loading={saving}>
                {editing ? t("save") : t("create")}
              </Button>
            </Group>
          </Stack>
        </form>
      ) : null}
    </Modal>
  );
}
