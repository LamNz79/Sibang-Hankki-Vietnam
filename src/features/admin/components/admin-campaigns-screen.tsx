"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Group,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui";
import { AdminShell } from "@/features/admin/components/admin-shell";
import {
  adminCampaignRecords,
  filterAdminCampaigns,
  type AdminCampaignPeriod,
  type AdminCampaignPlacement,
  type AdminCampaignStatus,
} from "@/features/admin/data/admin-campaigns";
import { uiColors } from "@/theme";

const campaignStyles = {
  weekendDining: { background: "#f7e7ea", color: "#8c2835" },
  hanoiNewOpen: { background: "#e4f0f8", color: "#27638d" },
  chefsChoice: { background: "#ece9e7", color: "#74533e" },
} as const;

const statusTones: Record<AdminCampaignStatus, "success" | "info" | "error"> = {
  live: "success",
  scheduled: "info",
  ended: "error",
};

export function AdminCampaignsScreen() {
  const t = useTranslations("Admin.campaigns");
  const [opened, { open, close }] = useDisclosure(false);
  const [placement, setPlacement] = useState<AdminCampaignPlacement | "all">("all");
  const [status, setStatus] = useState<AdminCampaignStatus | "all">("all");
  const [period, setPeriod] = useState<AdminCampaignPeriod>("all");
  const campaigns = useMemo(
    () => filterAdminCampaigns(adminCampaignRecords, placement, status, period),
    [period, placement, status],
  );

  return (
    <AdminShell>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Stack gap={3}>
            <Title order={1}>{t("title")}</Title>
            <Text c={uiColors.textSecondary}>{t("description")}</Text>
          </Stack>
          <Button color="warmCoral" radius="sm" onClick={open}>
            {t("createCampaign")}
          </Button>
        </Group>

        <Group gap="sm">
          <Select
            value={placement}
            onChange={(value) => setPlacement((value ?? "all") as typeof placement)}
            aria-label={t("filters.placementLabel")}
            data={[
              { value: "all", label: t("filters.placement.all") },
              { value: "homeMain", label: t("placements.homeMain") },
              { value: "searchTop", label: t("placements.searchTop") },
              { value: "regionalHome", label: t("placements.regionalHome") },
              { value: "storeDetail", label: t("placements.storeDetail") },
            ]}
            allowDeselect={false}
            w={190}
            radius="sm"
          />
          <Select
            value={status}
            onChange={(value) => setStatus((value ?? "all") as typeof status)}
            aria-label={t("filters.statusLabel")}
            data={[
              { value: "all", label: t("filters.status.all") },
              { value: "live", label: t("statuses.live") },
              { value: "scheduled", label: t("statuses.scheduled") },
              { value: "ended", label: t("statuses.ended") },
            ]}
            allowDeselect={false}
            w={170}
            radius="sm"
          />
          <Select
            value={period}
            onChange={(value) => setPeriod((value ?? "all") as AdminCampaignPeriod)}
            aria-label={t("filters.periodLabel")}
            data={[
              { value: "all", label: t("filters.period.all") },
              { value: "last30Days", label: t("filters.period.last30Days") },
              { value: "next30Days", label: t("filters.period.next30Days") },
            ]}
            allowDeselect={false}
            w={170}
            radius="sm"
          />
        </Group>

        {campaigns.length > 0 ? (
          <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="md">
            {campaigns.map((campaign) => {
              const style = campaignStyles[campaign.contentKey];

              return (
                <Card key={campaign.id} withBorder radius="sm" p={0}>
                  <Box py={34} px="md" ta="center" style={{ background: style.background }}>
                    <Title order={3} c={style.color}>
                      {t(`items.${campaign.contentKey}.headline`)}
                    </Title>
                    <Text size="xs" c={style.color} mt={4}>
                      {t(`items.${campaign.contentKey}.subtitle`)}
                    </Text>
                  </Box>
                  <Stack gap="md" p="md">
                    <StatusBadge tone={statusTones[campaign.status]} w="fit-content">
                      {t(`statuses.${campaign.status}`)}
                    </StatusBadge>
                    <Stack gap={2}>
                      <Text fw={800}>{t(`items.${campaign.contentKey}.name`)}</Text>
                      <Text size="xs" c={uiColors.textSecondary}>
                        {t(`placements.${campaign.placement}`)} · {t(`items.${campaign.contentKey}.schedule`)}
                      </Text>
                    </Stack>
                    <SimpleGrid cols={3} spacing="xs" pt="sm" style={{ borderTop: `1px solid ${uiColors.border}` }}>
                      {campaign.metrics.map((value, index) => (
                        <Stack key={`${campaign.id}-${index}`} gap={2}>
                          <Text size="10px" c={uiColors.textSecondary}>
                            {t(`items.${campaign.contentKey}.metric${index + 1}`)}
                          </Text>
                          <Text size="sm" fw={800}>{value}</Text>
                        </Stack>
                      ))}
                    </SimpleGrid>
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        ) : (
          <Card withBorder radius="sm" p="xl">
            <Text ta="center" c={uiColors.textSecondary}>{t("empty")}</Text>
          </Card>
        )}
      </Stack>

      <Modal opened={opened} onClose={close} title={t("modal.title")} radius="sm">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            close();
          }}
        >
          <Stack gap="md">
            <TextInput label={t("modal.name")} required radius="sm" />
            <Textarea label={t("modal.description")} rows={3} radius="sm" />
            <Select
              label={t("modal.placement")}
              data={[
                { value: "homeMain", label: t("placements.homeMain") },
                { value: "searchTop", label: t("placements.searchTop") },
                { value: "regionalHome", label: t("placements.regionalHome") },
                { value: "storeDetail", label: t("placements.storeDetail") },
              ]}
              required
              radius="sm"
            />
            <Group grow>
              <TextInput type="date" label={t("modal.startDate")} required radius="sm" />
              <TextInput type="date" label={t("modal.endDate")} required radius="sm" />
            </Group>
            <Group justify="flex-end" mt="sm">
              <Button variant="default" radius="sm" onClick={close}>{t("modal.cancel")}</Button>
              <Button type="submit" color="warmCoral" radius="sm">{t("modal.create")}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </AdminShell>
  );
}
