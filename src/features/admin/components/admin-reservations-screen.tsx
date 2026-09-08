"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconCalendarCheck,
  IconCalendarX,
  IconCircleCheck,
  IconSearch,
  IconUserQuestion,
} from "@tabler/icons-react";
import { StatusBadge } from "@/components/ui";
import { AdminShell } from "@/features/admin/components/admin-shell";
import {
  adminReservationRecords,
  filterAdminReservations,
  type AdminReservationStatus,
} from "@/features/admin/data/admin-reservations";
import { uiColors } from "@/theme";

const metrics = [
  { key: "confirmed", value: "1,248", icon: IconCalendarCheck, tone: "success" },
  { key: "checkedIn", value: "914", icon: IconCircleCheck, tone: "success" },
  { key: "cancelled", value: "86", icon: IconCalendarX, tone: "error" },
  { key: "noShow", value: "18", icon: IconUserQuestion, tone: "warning" },
] as const;

const statusTones: Record<AdminReservationStatus, "success" | "warning" | "info" | "error"> = {
  checkedIn: "success",
  noShowReview: "warning",
  confirmed: "info",
  cancelled: "error",
};

export function AdminReservationsScreen() {
  const t = useTranslations("Admin.reservations");
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 500);
  const [period, setPeriod] = useState<"today" | "last7Days" | "thisMonth">("today");
  const [status, setStatus] = useState<AdminReservationStatus | "all">("all");
  const reservations = useMemo(
    () => filterAdminReservations(adminReservationRecords, debouncedQuery, status, period),
    [debouncedQuery, period, status],
  );

  return (
    <AdminShell>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Stack gap={3}>
            <Title order={1}>{t("title")}</Title>
            <Text c={uiColors.textSecondary}>{t("description")}</Text>
          </Stack>
          <Button variant="default" radius="sm">{t("export")}</Button>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="md">
          {metrics.map(({ key, value, icon: Icon, tone }) => (
            <Card key={key} withBorder radius="sm" p="lg">
              <Group justify="space-between" align="flex-start">
                <Stack gap="md">
                  <Text size="sm" c={uiColors.textSecondary}>{t(`metrics.${key}.label`)}</Text>
                  <Title order={2}>{value}</Title>
                  <Text
                    size="xs"
                    fw={700}
                    c={
                      tone === "success"
                        ? uiColors.statusSuccessText
                        : tone === "error"
                          ? uiColors.statusErrorText
                          : uiColors.statusWarningText
                    }
                  >
                    {t(`metrics.${key}.detail`)}
                  </Text>
                </Stack>
                <ThemeIcon color="warmCoral" variant="light" size={38} radius="sm"><Icon size={19} /></ThemeIcon>
              </Group>
            </Card>
          ))}
        </SimpleGrid>

        <Group align="flex-end" gap="sm">
          <TextInput
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder={t("filters.searchPlaceholder")}
            aria-label={t("filters.searchLabel")}
            leftSection={<IconSearch size={16} />}
            style={{ flex: 1 }}
            miw={240}
            radius="sm"
          />
          <Select
            value={period}
            aria-label={t("filters.periodLabel")}
            onChange={(value) => setPeriod((value ?? "today") as typeof period)}
            data={[
              { value: "today", label: t("filters.period.today") },
              { value: "last7Days", label: t("filters.period.last7Days") },
              { value: "thisMonth", label: t("filters.period.thisMonth") },
            ]}
            allowDeselect={false}
            w={170}
            radius="sm"
          />
          <Select
            value={status}
            aria-label={t("filters.statusLabel")}
            onChange={(value) => setStatus((value ?? "all") as typeof status)}
            data={[
              { value: "all", label: t("filters.status.all") },
              { value: "confirmed", label: t("statuses.confirmed") },
              { value: "checkedIn", label: t("statuses.checkedIn") },
              { value: "cancelled", label: t("statuses.cancelled") },
              { value: "noShowReview", label: t("statuses.noShowReview") },
            ]}
            allowDeselect={false}
            w={210}
            radius="sm"
          />
        </Group>

        <Card withBorder radius="sm" p={0}>
          <Table.ScrollContainer minWidth={900}>
            <Table verticalSpacing="md" horizontalSpacing="md" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t("table.id")}</Table.Th>
                  <Table.Th>{t("table.customer")}</Table.Th>
                  <Table.Th>{t("table.store")}</Table.Th>
                  <Table.Th>{t("table.dateParty")}</Table.Th>
                  <Table.Th>{t("table.checkIn")}</Table.Th>
                  <Table.Th>{t("table.status")}</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {reservations.map((reservation) => (
                  <Table.Tr key={reservation.id}>
                    <Table.Td>
                      <Text fw={750} size="sm">{reservation.id}</Text>
                      <Text size="xs" c={uiColors.textSecondary}>{t(`channels.${reservation.channel}`)}</Text>
                    </Table.Td>
                    <Table.Td>{reservation.customer}</Table.Td>
                    <Table.Td>{reservation.store}</Table.Td>
                    <Table.Td>{t("table.slot", { time: reservation.time, count: reservation.partySize })}</Table.Td>
                    <Table.Td>{t(`checkIn.${reservation.checkIn}`)}</Table.Td>
                    <Table.Td>
                      <StatusBadge tone={statusTones[reservation.status]}>
                        {t(`statuses.${reservation.status}`)}
                      </StatusBadge>
                    </Table.Td>
                    <Table.Td>
                      <Button
                        variant="subtle"
                        color="warmCoral"
                        size="compact-sm"
                      >
                        {reservation.status === "noShowReview"
                          ? t("resolve")
                          : t("details")}
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          {reservations.length === 0 ? (
            <Text ta="center" c={uiColors.textSecondary} py="xl">{t("empty")}</Text>
          ) : null}
        </Card>
      </Stack>
    </AdminShell>
  );
}
