"use client";

import { Card, Stack, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { uiColors } from "@/theme";

export type AdminSection =
  | "stores"
  | "revenue"
  | "campaigns"
  | "settings";

export function AdminSectionPlaceholder({ section }: { section: AdminSection }) {
  const t = useTranslations(`Admin.sections.${section}`);

  return (
    <AdminShell>
      <Stack gap="lg">
        <Stack gap={3}>
          <Title order={1}>{t("title")}</Title>
          <Text c={uiColors.textSecondary}>{t("description")}</Text>
        </Stack>
        <Card withBorder radius="sm" p="xl">
          <Text ta="center" c={uiColors.textSecondary}>
            {t("placeholder")}
          </Text>
        </Card>
      </Stack>
    </AdminShell>
  );
}
