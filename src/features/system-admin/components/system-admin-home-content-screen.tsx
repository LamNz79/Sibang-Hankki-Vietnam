"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Group,
  Loader,
  NumberInput,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDeviceFloppy, IconPhoto } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  getSystemAdminHomeContent,
  updateSystemAdminCityImage,
  updateSystemAdminHeroBanner,
  type AdminCityImage,
  type AdminHeroBanner,
  type AdminHomeContent,
} from "@/features/home/data/home-content";
import { uiColors } from "@/theme";

const queryKey = ["system-admin-home-content"] as const;
const emptyHero: AdminHeroBanner = {
  titleVi: "",
  titleEn: "",
  titleKo: "",
  descriptionVi: "",
  descriptionEn: "",
  descriptionKo: "",
  imageUrl: "",
  imageAltVi: "",
  imageAltEn: "",
  imageAltKo: "",
  targetUrl: "",
  enabled: true,
};
const languages = [
  { value: "vi", titleKey: "titleVi", descriptionKey: "descriptionVi", altKey: "imageAltVi" },
  { value: "en", titleKey: "titleEn", descriptionKey: "descriptionEn", altKey: "imageAltEn" },
  { value: "ko", titleKey: "titleKo", descriptionKey: "descriptionKo", altKey: "imageAltKo" },
] as const;

export function SystemAdminHomeContentScreen() {
  const t = useTranslations("SystemAdmin.homeContent");
  const contentQuery = useQuery({
    queryKey,
    queryFn: ({ signal }) => getSystemAdminHomeContent(signal),
    retry: false,
  });

  if (contentQuery.isError) {
    return (
      <Alert color="red" title={t("loadError")}>
        <Button mt="sm" size="xs" variant="light" onClick={() => contentQuery.refetch()}>
          {t("retry")}
        </Button>
      </Alert>
    );
  }
  if (contentQuery.isLoading || !contentQuery.data) {
    return <Group justify="center" mih={320}><Loader /></Group>;
  }

  return <HomeContentEditor initialContent={contentQuery.data} />;
}

function HomeContentEditor({ initialContent }: { initialContent: AdminHomeContent }) {
  const t = useTranslations("SystemAdmin.homeContent");
  const queryClient = useQueryClient();
  const [hero, setHero] = useState<AdminHeroBanner>(
    initialContent.heroBanner ?? emptyHero,
  );
  const [cities, setCities] = useState<AdminCityImage[]>(initialContent.cityImages);
  const updateCache = (update: (current: AdminHomeContent) => AdminHomeContent) => {
    queryClient.setQueryData<AdminHomeContent>(queryKey, (current) =>
      current ? update(current) : current,
    );
  };
  const heroMutation = useMutation({
    mutationFn: updateSystemAdminHeroBanner,
    onSuccess: (saved) => {
      setHero(saved);
      updateCache((current) => ({ ...current, heroBanner: saved }));
      notifications.show({ color: "teal", message: t("hero.saved") });
    },
    onError: () => notifications.show({ color: "red", message: t("hero.saveError") }),
  });
  const cityMutation = useMutation({
    mutationFn: updateSystemAdminCityImage,
    onSuccess: (saved) => {
      setCities((current) => current.map((city) =>
        city.provinceCode === saved.provinceCode ? saved : city,
      ));
      updateCache((current) => ({
        ...current,
        cityImages: current.cityImages.map((city) =>
          city.provinceCode === saved.provinceCode ? saved : city,
        ),
      }));
      notifications.show({ color: "teal", message: t("cities.saved") });
    },
    onError: () => notifications.show({ color: "red", message: t("cities.saveError") }),
  });

  const heroValid = hero.imageUrl.trim() !== "" && hero.targetUrl.trim() !== "";

  return (
    <Stack gap="xl">
      <Stack gap={3}>
        <Title order={1}>{t("title")}</Title>
        <Text c={uiColors.textSecondary}>{t("description")}</Text>
      </Stack>

      <Card withBorder p="lg">
        <Stack gap="lg">
          <Group justify="space-between" align="flex-start">
            <Stack gap={2}>
              <Text fw={850}>{t("hero.title")}</Text>
              <Text size="sm" c={uiColors.textSecondary}>{t("hero.description")}</Text>
            </Stack>
            <Switch
              label={t("enabled")}
              checked={hero.enabled}
              onChange={(event) => setHero((current) => ({
                ...current,
                enabled: event.currentTarget.checked,
              }))}
            />
          </Group>

          <Box
            mih={190}
            p="xl"
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: 12,
              color: "white",
              backgroundImage: `linear-gradient(90deg, rgba(26,12,7,.82), rgba(26,12,7,.18)), url('${hero.imageUrl}')`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              border: `1px solid ${uiColors.border}`,
            }}
          >
            <Stack gap={6} maw={540}>
              <Text size="xs" fw={800} tt="uppercase">{t("hero.preview")}</Text>
              <Title order={2}>{hero.titleVi || hero.titleEn || t("hero.previewTitle")}</Title>
              <Text size="sm">{hero.descriptionVi || hero.descriptionEn}</Text>
            </Stack>
          </Box>

          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <TextInput
              required
              label={t("hero.imageUrl")}
              description={t("hero.imageUrlHint")}
              value={hero.imageUrl}
              onChange={(event) => setHero((current) => ({
                ...current,
                imageUrl: event.currentTarget.value,
              }))}
            />
            <TextInput
              required
              label={t("hero.targetUrl")}
              description={t("hero.targetUrlHint")}
              value={hero.targetUrl}
              onChange={(event) => setHero((current) => ({
                ...current,
                targetUrl: event.currentTarget.value,
              }))}
            />
          </SimpleGrid>

          <Tabs defaultValue="vi" keepMounted={false}>
            <Tabs.List>
              {languages.map(({ value }) => (
                <Tabs.Tab key={value} value={value}>{t(`languages.${value}`)}</Tabs.Tab>
              ))}
            </Tabs.List>
            {languages.map(({ value, titleKey, descriptionKey, altKey }) => (
              <Tabs.Panel key={value} value={value} pt="md">
                <SimpleGrid cols={{ base: 1, md: 2 }}>
                  <TextInput
                    label={t("hero.headline")}
                    maxLength={120}
                    value={hero[titleKey] ?? ""}
                    onChange={(event) => setHero((current) => ({
                      ...current,
                      [titleKey]: event.currentTarget.value,
                    }))}
                  />
                  <TextInput
                    label={t("imageAlt")}
                    maxLength={300}
                    value={hero[altKey] ?? ""}
                    onChange={(event) => setHero((current) => ({
                      ...current,
                      [altKey]: event.currentTarget.value,
                    }))}
                  />
                  <Textarea
                    label={t("hero.copy")}
                    maxLength={500}
                    autosize
                    minRows={2}
                    value={hero[descriptionKey] ?? ""}
                    onChange={(event) => setHero((current) => ({
                      ...current,
                      [descriptionKey]: event.currentTarget.value,
                    }))}
                  />
                </SimpleGrid>
              </Tabs.Panel>
            ))}
          </Tabs>

          <Group justify="flex-end">
            <Button
              leftSection={<IconDeviceFloppy size={17} />}
              onClick={() => heroMutation.mutate(hero)}
              loading={heroMutation.isPending}
              disabled={!heroValid}
            >
              {t("hero.save")}
            </Button>
          </Group>
        </Stack>
      </Card>

      <Stack gap="md">
        <Stack gap={2}>
          <Text fw={850} size="lg">{t("cities.title")}</Text>
          <Text size="sm" c={uiColors.textSecondary}>{t("cities.description")}</Text>
        </Stack>
        <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md">
          {cities.map((city, index) => {
            const valid = city.citySlug.trim() !== "" && city.imageUrl.trim() !== "";
            const saving = cityMutation.isPending
              && cityMutation.variables?.provinceCode === city.provinceCode;
            return (
              <Card key={city.provinceCode} withBorder p="md">
                <Stack gap="md">
                  <Box
                    h={130}
                    style={{
                      borderRadius: 8,
                      background: `url('${city.imageUrl}') center / cover`,
                      border: `1px solid ${uiColors.border}`,
                    }}
                  />
                  <Group justify="space-between">
                    <Group gap="xs">
                      <IconPhoto size={18} />
                      <Text fw={800}>{city.imageAlt || city.citySlug}</Text>
                    </Group>
                    <Switch
                      aria-label={t("enabled")}
                      checked={city.enabled}
                      onChange={(event) => setCities((current) => current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, enabled: event.currentTarget.checked } : item,
                      ))}
                    />
                  </Group>
                  <TextInput
                    label={t("cities.slug")}
                    value={city.citySlug}
                    onChange={(event) => setCities((current) => current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, citySlug: event.currentTarget.value } : item,
                    ))}
                  />
                  <TextInput
                    label={t("cities.imageUrl")}
                    value={city.imageUrl}
                    onChange={(event) => setCities((current) => current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, imageUrl: event.currentTarget.value } : item,
                    ))}
                  />
                  <TextInput
                    label={t("imageAlt")}
                    value={city.imageAlt ?? ""}
                    onChange={(event) => setCities((current) => current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, imageAlt: event.currentTarget.value } : item,
                    ))}
                  />
                  <NumberInput
                    label={t("cities.sortOrder")}
                    min={0}
                    value={city.sortOrder}
                    onChange={(value) => setCities((current) => current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, sortOrder: Number(value) || 0 } : item,
                    ))}
                  />
                  <Button
                    variant="light"
                    leftSection={<IconDeviceFloppy size={17} />}
                    onClick={() => cityMutation.mutate(city)}
                    loading={saving}
                    disabled={!valid || (cityMutation.isPending && !saving)}
                  >
                    {t("cities.save")}
                  </Button>
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
