"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  ColorInput,
  Group,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDeviceFloppy, IconRestore } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useAccountPreferences } from "@/features/system-admin/components/account-preferences-context";
import {
  defaultAccountPreferences,
  resetAccountPreferences,
  updateAccountPreferences,
  type AccountPreferences,
} from "@/features/system-admin/data/account-preferences";
import { uiColors } from "@/theme";

const themeSwatches = ["#B84A2F", "#C45870", "#3A7C6E", "#2563EB"];

export function SystemAdminPreferencesScreen() {
  const t = useTranslations("SystemAdmin.preferences");
  const preferences = useAccountPreferences();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AccountPreferences>(preferences);

  const apply = (next: AccountPreferences) => {
    queryClient.setQueryData(["account-preferences"], next);
  };
  const saveMutation = useMutation({
    mutationFn: () => updateAccountPreferences({
      ...form,
      themeColor: form.themeColor.toUpperCase(),
    }),
    onSuccess: (saved) => {
      setForm(saved);
      apply(saved);
      notifications.show({ color: "teal", message: t("saved") });
    },
    onError: () => notifications.show({ color: "red", message: t("saveError") }),
  });
  const resetMutation = useMutation({
    mutationFn: resetAccountPreferences,
    onSuccess: () => {
      setForm(defaultAccountPreferences);
      apply(defaultAccountPreferences);
      notifications.show({ color: "teal", message: t("resetDone") });
    },
    onError: () => notifications.show({ color: "red", message: t("resetError") }),
  });
  const validColor = /^#[0-9A-Fa-f]{6}$/.test(form.themeColor);
  const pending = saveMutation.isPending || resetMutation.isPending;

  return (
    <Stack gap="xl" maw={900}>
      <Group justify="space-between" align="flex-end">
        <Stack gap={3}>
          <Title order={1}>{t("title")}</Title>
          <Text c={uiColors.textSecondary}>{t("description")}</Text>
        </Stack>
        <Group gap="sm">
          <Button
            variant="default"
            leftSection={<IconRestore size={17} />}
            onClick={() => resetMutation.mutate()}
            loading={resetMutation.isPending}
            disabled={saveMutation.isPending}
          >
            {t("reset")}
          </Button>
          <Button
            leftSection={<IconDeviceFloppy size={17} />}
            color="#332D2F"
            autoContrast
            onClick={() => saveMutation.mutate()}
            loading={saveMutation.isPending}
            disabled={!validColor || resetMutation.isPending}
          >
            {t("save")}
          </Button>
        </Group>
      </Group>

      <Card withBorder p="lg">
        <Stack gap="lg">
          <Stack gap={2}>
            <Text fw={800}>{t("appearance.title")}</Text>
            <Text size="sm" c={uiColors.textSecondary}>{t("appearance.description")}</Text>
          </Stack>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            <ColorInput
              label={t("appearance.themeColor")}
              description={t("appearance.themeColorHint")}
              value={form.themeColor}
              onChange={(themeColor) => setForm((current) => ({ ...current, themeColor }))}
              format="hex"
              swatches={themeSwatches}
              error={form.themeColor && !validColor ? t("appearance.invalidColor") : undefined}
              disabled={pending}
            />
            <Stack gap="xs">
              <Text size="sm" fw={500}>{t("appearance.preview")}</Text>
              <Group
                justify="space-between"
                p="md"
                style={{
                  border: `1px solid ${uiColors.border}`,
                  borderRadius: 10,
                  background: uiColors.surfaceMuted,
                }}
              >
                <Text size="sm" fw={700}>{t("appearance.previewText")}</Text>
                <Button
                  size="compact-sm"
                  color={validColor ? form.themeColor : defaultAccountPreferences.themeColor}
                  autoContrast
                >
                  {t("appearance.previewButton")}
                </Button>
              </Group>
            </Stack>
          </SimpleGrid>
          <Stack gap="xs">
            <Text size="sm" fw={500}>{t("appearance.density")}</Text>
            <SegmentedControl
              value={form.displayDensity}
              onChange={(displayDensity) => setForm((current) => ({
                ...current,
                displayDensity: displayDensity as AccountPreferences["displayDensity"],
              }))}
              data={[
                { value: "COMFORTABLE", label: t("appearance.comfortable") },
                { value: "COMPACT", label: t("appearance.compact") },
              ]}
              disabled={pending}
            />
          </Stack>
        </Stack>
      </Card>

      <Card withBorder p="lg">
        <Stack gap="lg">
          <Stack gap={2}>
            <Text fw={800}>{t("display.title")}</Text>
            <Text size="sm" c={uiColors.textSecondary}>{t("display.description")}</Text>
          </Stack>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <Select
              label={t("display.pageSize")}
              value={String(form.tablePageSize)}
              onChange={(value) => value && setForm((current) => ({
                ...current,
                tablePageSize: Number(value) as AccountPreferences["tablePageSize"],
              }))}
              data={["10", "20", "50"]}
              allowDeselect={false}
              disabled={pending}
            />
            <Select
              label={t("display.dateFormat")}
              value={form.dateFormat}
              onChange={(dateFormat) => dateFormat && setForm((current) => ({
                ...current,
                dateFormat: dateFormat as AccountPreferences["dateFormat"],
              }))}
              data={[
                { value: "DD_MM_YYYY", label: "DD/MM/YYYY" },
                { value: "MM_DD_YYYY", label: "MM/DD/YYYY" },
              ]}
              allowDeselect={false}
              disabled={pending}
            />
            <Select
              label={t("display.language")}
              value={form.locale}
              onChange={(locale) => locale && setForm((current) => ({
                ...current,
                locale: locale as AccountPreferences["locale"],
              }))}
              data={[
                { value: "vi", label: t("display.vietnamese") },
                { value: "en", label: t("display.english") },
              ]}
              allowDeselect={false}
              disabled={pending}
            />
          </SimpleGrid>
        </Stack>
      </Card>

      {saveMutation.isError || resetMutation.isError ? (
        <Alert color="red">{t("errorHint")}</Alert>
      ) : null}
    </Stack>
  );
}
