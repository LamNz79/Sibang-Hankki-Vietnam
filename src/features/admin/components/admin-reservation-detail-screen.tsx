"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  Button,
  Card,
  Grid,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { StatusBadge } from "@/components/ui";
import { AdminShell } from "@/features/admin/components/admin-shell";
import type {
  AdminReservationRecord,
  AdminReservationStatus,
} from "@/features/admin/data/admin-reservations";
import { uiColors } from "@/theme";

const statusTones: Record<
  AdminReservationStatus,
  "success" | "warning" | "info" | "error"
> = {
  checkedIn: "success",
  noShowReview: "warning",
  confirmed: "info",
  cancelled: "error",
};

export function AdminReservationDetailScreen({
  reservation,
}: {
  reservation: AdminReservationRecord;
}) {
  const locale = useLocale();
  const t = useTranslations("Admin.reservationDetail");
  const reservationsT = useTranslations("Admin.reservations");
  const [status, setStatus] = useState(reservation.status);
  const [nextStatus, setNextStatus] = useState<AdminReservationStatus>(
    reservation.status,
  );
  const [reason, setReason] = useState("");
  const [opened, setOpened] = useState(false);
  const reasonRequired =
    nextStatus === "cancelled" || nextStatus === "noShowReview";
  const formattedDate = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
  }).format(new Date(`${reservation.date}T00:00:00`));

  return (
    <AdminShell>
      <Stack gap="xl">
        <Stack gap="sm">
          <Button
            component={Link}
            href="/admin/reservations"
            variant="subtle"
            color="warmCoral"
            size="compact-sm"
            leftSection={<IconArrowLeft size={16} />}
            w="fit-content"
          >
            {t("back")}
          </Button>
          <Group justify="space-between" align="flex-end">
            <Stack gap={3}>
              <Title order={1}>{t("title")}</Title>
              <Text c={uiColors.textSecondary}>{reservation.id}</Text>
            </Stack>
            <Group>
              <StatusBadge tone={statusTones[status]}>
                {reservationsT(`statuses.${status}`)}
              </StatusBadge>
              <Button
                color="warmCoral"
                radius="sm"
                onClick={() => {
                  setNextStatus(status);
                  setReason("");
                  setOpened(true);
                }}
              >
                {t("changeStatus")}
              </Button>
            </Group>
          </Group>
        </Stack>

        <Grid>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <DetailCard title={t("reservation.title")}>
              <DetailRow label={t("reservation.date")} value={formattedDate} />
              <DetailRow label={t("reservation.time")} value={reservation.time} />
              <DetailRow
                label={t("reservation.partySize")}
                value={t("reservation.guests", { count: reservation.partySize })}
              />
              <DetailRow
                label={t("reservation.channel")}
                value={reservationsT(`channels.${reservation.channel}`)}
              />
              <DetailRow label={t("reservation.request")} value={reservation.request} />
            </DetailCard>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 6 }}>
            <DetailCard title={t("customer.title")}>
              <DetailRow label={t("customer.name")} value={reservation.customer} />
              <DetailRow label={t("customer.phone")} value={reservation.phone} />
              <DetailRow label={t("customer.email")} value={reservation.email} />
              <DetailRow
                label={t("customer.language")}
                value={t(`languages.${reservation.language}`)}
              />
              <DetailRow label={t("customer.store")} value={reservation.store} />
            </DetailCard>
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <DetailCard title={t("checkIn.title")}>
              <DetailRow
                label={t("checkIn.status")}
                value={reservationsT(`checkIn.${reservation.checkIn}`)}
              />
              <DetailRow
                label={t("checkIn.method")}
                value={reservation.checkIn === "qrComplete" ? t("checkIn.qr") : t("notAvailable")}
              />
            </DetailCard>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <DetailCard title={t("history.title")}>
              <DetailRow
                label={t("history.created")}
                value={`${reservation.date} · ${reservation.time}`}
              />
              <DetailRow
                label={t("history.currentStatus")}
                value={reservationsT(`statuses.${status}`)}
              />
            </DetailCard>
          </Grid.Col>
        </Grid>
      </Stack>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t("modal.title")}
        radius="sm"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setStatus(nextStatus);
            setOpened(false);
            setReason("");
          }}
        >
          <Stack>
            <Select
              label={t("modal.status")}
              value={nextStatus}
              onChange={(value) =>
                setNextStatus((value ?? reservation.status) as AdminReservationStatus)
              }
              data={(["confirmed", "checkedIn", "cancelled", "noShowReview"] as const).map(
                (value) => ({
                  value,
                  label: reservationsT(`statuses.${value}`),
                }),
              )}
              allowDeselect={false}
              radius="sm"
            />
            <Textarea
              label={t("modal.reason")}
              value={reason}
              onChange={(event) => setReason(event.currentTarget.value)}
              required={reasonRequired}
              description={reasonRequired ? t("modal.reasonRequired") : undefined}
              radius="sm"
            />
            <Text size="xs" c={uiColors.textSecondary}>{t("modal.prototypeNotice")}</Text>
            <Group justify="flex-end">
              <Button variant="default" radius="sm" onClick={() => setOpened(false)}>
                {t("modal.cancel")}
              </Button>
              <Button type="submit" color="warmCoral" radius="sm">
                {t("modal.save")}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </AdminShell>
  );
}

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card withBorder radius="sm" p={0} h="100%">
      <Text fw={800} px="md" py="sm" style={{ borderBottom: `1px solid ${uiColors.border}` }}>
        {title}
      </Text>
      <Stack gap={0}>{children}</Stack>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between" wrap="nowrap" px="md" py="sm">
      <Text size="sm" c={uiColors.textSecondary}>{label}</Text>
      <Text size="sm" fw={650} ta="right">{value}</Text>
    </Group>
  );
}
