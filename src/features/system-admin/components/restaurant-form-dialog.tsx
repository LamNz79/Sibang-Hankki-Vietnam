"use client";

import { useState, type FormEvent } from "react";
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
import type {
  SystemAdminRestaurantDetail,
  SystemAdminRestaurantInput,
} from "@/features/system-admin/data/system-admin-directory";

const emptyRestaurant: SystemAdminRestaurantInput = {
  slug: "",
  name: "",
  description: "",
  cuisineType: "",
  cuisineLabel: "",
  citySlug: "",
  area: "",
  district: "",
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

function toInput(restaurant: SystemAdminRestaurantDetail | null) {
  if (!restaurant) return emptyRestaurant;
  return {
    slug: restaurant.slug,
    name: restaurant.name,
    description: restaurant.description ?? "",
    cuisineType: restaurant.cuisineType ?? "",
    cuisineLabel: restaurant.cuisineLabel ?? "",
    citySlug: restaurant.citySlug,
    area: restaurant.area ?? "",
    district: restaurant.district ?? "",
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
  const [input, setInput] = useState<SystemAdminRestaurantInput>(() =>
    toInput(restaurant));
  const change = (field: keyof SystemAdminRestaurantInput) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setInput((current) => ({ ...current, [field]: event.currentTarget.value }));
  const changeCuisine = (value: string | null) =>
    setInput((current) => ({
      ...current,
      cuisineType: value ?? "",
      cuisineLabel: value ? cuisineLabels[value] : "",
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
                value={input.slug ?? ""}
                onChange={change("slug")}
                disabled={editing}
                required
                maxLength={160}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              />
              <TextInput
                label={t("name")}
                value={input.name}
                onChange={change("name")}
                required
                maxLength={200}
              />
              <TextInput
                label={t("citySlug")}
                value={input.citySlug}
                onChange={change("citySlug")}
                required
                maxLength={160}
              />
              <TextInput
                label={t("timezone")}
                value={input.timezone}
                onChange={change("timezone")}
                required
                maxLength={64}
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
              <TextInput
                label={t("area")}
                value={input.area}
                onChange={change("area")}
                maxLength={160}
              />
              <TextInput
                label={t("district")}
                value={input.district}
                onChange={change("district")}
                maxLength={160}
              />
              <TextInput
                label={t("phone")}
                value={input.phone}
                onChange={change("phone")}
                maxLength={30}
              />
              <TextInput
                label={t("email")}
                type="email"
                value={input.email}
                onChange={change("email")}
                maxLength={320}
              />
              <TextInput
                label={t("priceRange")}
                value={input.priceRange}
                onChange={change("priceRange")}
                maxLength={40}
              />
            </SimpleGrid>
            <Textarea
              label={t("address")}
              value={input.address}
              onChange={change("address")}
              autosize
              minRows={2}
            />
            <Textarea
              label={t("description")}
              value={input.description}
              onChange={change("description")}
              autosize
              minRows={3}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={onClose} disabled={saving}>
                {t("cancel")}
              </Button>
              <Button type="submit" loading={saving}>
                {editing ? t("save") : t("create")}
              </Button>
            </Group>
          </Stack>
        </form>
      ) : null}
    </Modal>
  );
}
