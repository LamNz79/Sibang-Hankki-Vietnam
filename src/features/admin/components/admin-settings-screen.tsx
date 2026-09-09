"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Grid,
  Group,
  Modal,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslations } from "next-intl";
import { StatusBadge, WorkspaceSwitcher } from "@/components/ui";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { uiColors } from "@/theme";

const initialSettings = {
  storeRegistration: true,
  noShowRestriction: true,
  bannerEndAlert: false,
};

const settingKeys = Object.keys(initialSettings) as (keyof typeof initialSettings)[];
const roles = [
  { key: "superAdmin", users: 2, tone: "brand" },
  { key: "operations", users: 6, tone: "success" },
  { key: "marketing", users: 3, tone: "info" },
  { key: "finance", users: 2, tone: "warning" },
] as const;

export function AdminSettingsScreen() {
  const t = useTranslations("Admin.settings");
  const [settings, setSettings] = useState(initialSettings);
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <AdminShell>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Stack gap={3}>
            <Title order={1}>{t("title")}</Title>
            <Text c={uiColors.textSecondary}>{t("description")}</Text>
          </Stack>
          <Button color="warmCoral" radius="sm" onClick={open}>
            {t("inviteAdmin")}
          </Button>
        </Group>

        <Card withBorder radius="sm" p="md">
          <WorkspaceSwitcher />
        </Card>

        <Grid gap="md">
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Card withBorder radius="sm" p={0} h="100%">
              <Group
                justify="space-between"
                px="md"
                py="sm"
                style={{ borderBottom: `1px solid ${uiColors.border}` }}
              >
                <Text fw={800}>{t("operations.title")}</Text>
                <Text size="xs" c={uiColors.textSecondary}>
                  {t("operations.scope")}
                </Text>
              </Group>
              <Stack gap={0}>
                {settingKeys.map((key) => (
                  <Group
                    key={key}
                    justify="space-between"
                    wrap="nowrap"
                    px="md"
                    py="md"
                    style={{ borderBottom: `1px solid ${uiColors.border}` }}
                  >
                    <Stack gap={2}>
                      <Text size="sm" fw={750}>{t(`operations.items.${key}.title`)}</Text>
                      <Text size="xs" c={uiColors.textSecondary}>
                        {t(`operations.items.${key}.description`)}
                      </Text>
                    </Stack>
                    <Switch
                      checked={settings[key]}
                      onChange={(event) =>
                        setSettings((current) => ({
                          ...current,
                          [key]: event.currentTarget.checked,
                        }))
                      }
                      color="warmCoral"
                      aria-label={t(`operations.items.${key}.title`)}
                    />
                  </Group>
                ))}
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Card withBorder radius="sm" p={0} h="100%">
              <Group
                justify="space-between"
                px="md"
                py="sm"
                style={{ borderBottom: `1px solid ${uiColors.border}` }}
              >
                <Text fw={800}>{t("roles.title")}</Text>
                <Button variant="subtle" color="warmCoral" size="compact-xs">
                  {t("roles.manage")}
                </Button>
              </Group>
              <Stack gap={0}>
                {roles.map(({ key, users, tone }) => (
                  <Group
                    key={key}
                    justify="space-between"
                    wrap="nowrap"
                    px="md"
                    py="md"
                    style={{ borderBottom: `1px solid ${uiColors.border}` }}
                  >
                    <Stack gap={2}>
                      <Text size="sm" fw={750}>{t(`roles.items.${key}.title`)}</Text>
                      <Text size="xs" c={uiColors.textSecondary}>
                        {t(`roles.items.${key}.description`, { users })}
                      </Text>
                    </Stack>
                    <StatusBadge tone={tone}>{t(`roles.items.${key}.badge`)}</StatusBadge>
                  </Group>
                ))}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>

      <Modal opened={opened} onClose={close} title={t("modal.title")} radius="sm">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            close();
          }}
        >
          <Stack gap="md">
            <TextInput type="email" label={t("modal.email")} required radius="sm" />
            <Select
              label={t("modal.role")}
              data={roles.map(({ key }) => ({
                value: key,
                label: t(`roles.items.${key}.title`),
              }))}
              required
              radius="sm"
            />
            <Switch label={t("modal.requireMfa")} defaultChecked color="warmCoral" />
            <Group justify="flex-end" mt="sm">
              <Button variant="default" radius="sm" onClick={close}>{t("modal.cancel")}</Button>
              <Button type="submit" color="warmCoral" radius="sm">{t("modal.invite")}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </AdminShell>
  );
}
