"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconCheck,
  IconMapPin,
  IconPhone,
  IconQrcode,
  IconUsers,
} from "@tabler/icons-react";
import { MobileShell } from "@/components/layout/customer";
import { PrimaryActionButton, StatusBadge, SurfaceCard } from "@/components/ui";
import { LanguageSelect } from "@/features/i18n";
import { uiColors } from "@/theme";
import {
  callWaitlistTicket,
  type WaitlistStatus,
  type WaitlistTicket,
} from "../domain/waitlist";

const demoRestaurant = {
  name: "Anan Saigon",
  slug: "anan-saigon",
  waitingParties: 8,
};

const demoTicket: WaitlistTicket = {
  queueNumber: "W-042",
  partySize: 2,
  restaurantName: demoRestaurant.name,
  restaurantSlug: demoRestaurant.slug,
  status: "waiting",
};

export function VenueWaitlistScreen() {
  const t = useTranslations("Waitlist.venue");
  const ticketT = useTranslations("Waitlist.ticket");
  const [method, setMethod] = useState<"phone" | "qr" | null>(null);
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState<number | string>(2);
  const [ticket, setTicket] = useState<WaitlistTicket | null>(null);

  if (ticket) {
    return (
      <MobileShell title={t("title")} backHref="/" bottomNav={null}>
        <WaitlistTicketCard ticket={ticket} t={ticketT} />
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => setTicket(null)}
        >
          {t("startAnother")}
        </Button>
      </MobileShell>
    );
  }

  const canConfirm = method === "qr" || phone.replace(/\D/g, "").length >= 8;

  return (
    <MobileShell
      title={t("title")}
      backHref="/"
      bottomNav={null}
      headerAction={<LanguageSelect compact radius="md" />}
    >
      <Paper p="md" radius="lg" withBorder style={{ background: uiColors.brandPrimarySubtle }}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={4}>
            <Text size="sm" c={uiColors.textSecondary}>{t("restaurantLabel")}</Text>
            <Title order={2}>{demoRestaurant.name}</Title>
            <Group gap={6}>
              <IconUsers size={16} />
              <Text size="sm">{t("waitingParties", { count: demoRestaurant.waitingParties })}</Text>
            </Group>
          </Stack>
        </Group>
      </Paper>

      {!method ? (
        <Stack gap="md">
          <Group gap="xs" align="center">
            <ThemeIcon size={28} radius="xl" color="warmCoral">
              <Text size="sm" fw={800} c="white">1</Text>
            </ThemeIcon>
            <Text size="sm" fw={750} c={uiColors.brandPrimary}>{t("stepOf")}</Text>
          </Group>
          <Stack gap={4}>
            <Title order={3}>{t("chooseMethod")}</Title>
            <Text c={uiColors.textSecondary}>{t("chooseMethodHint")}</Text>
          </Stack>
          <Stack gap="sm">
            <Stack gap={4}>
              <Button
                fullWidth
                size="lg"
                variant="default"
                leftSection={<IconPhone size={22} />}
                onClick={() => setMethod("phone")}
                styles={{ label: { whiteSpace: "normal" } }}
              >
                {t("phone")}
              </Button>
              <Text size="xs" c={uiColors.textSecondary} pl={12}>{t("phoneHint")}</Text>
            </Stack>
            <Stack gap={4}>
              <Button
                fullWidth
                size="lg"
                variant="default"
                leftSection={<IconQrcode size={22} />}
                onClick={() => setMethod("qr")}
                styles={{ label: { whiteSpace: "normal" } }}
              >
                {t("memberQr")}
              </Button>
              <Text size="xs" c={uiColors.textSecondary} pl={12}>{t("memberQrHint")}</Text>
            </Stack>
          </Stack>
          <Card withBorder radius="lg" p="md" style={{ background: uiColors.surfaceAlt }}>
            <Group gap="sm" align="flex-start" wrap="nowrap">
              <ThemeIcon size={34} radius="xl" variant="light" color="warmCoral">
                <IconMapPin size={18} />
              </ThemeIcon>
              <Stack gap={2}>
                <Text fw={750}>{t("onsiteTitle")}</Text>
                <Text size="sm" c={uiColors.textSecondary}>{t("onsiteDescription")}</Text>
              </Stack>
            </Group>
          </Card>
          <Card withBorder radius="lg" p="md">
            <Stack gap="sm">
              <Title order={4}>{t("howItWorks")}</Title>
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                {[t("howItWorksStep1"), t("howItWorksStep2"), t("howItWorksStep3")].map((label, index) => (
                  <Group key={label} gap="xs" align="flex-start" wrap="nowrap">
                    <ThemeIcon size={24} radius="xl" color="warmCoral">
                      <Text size="xs" fw={800} c="white">{index + 1}</Text>
                    </ThemeIcon>
                    <Text size="sm" c={uiColors.textSecondary}>{label}</Text>
                  </Group>
                ))}
              </SimpleGrid>
            </Stack>
          </Card>
        </Stack>
      ) : (
        <SurfaceCard p="lg">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>{method === "phone" ? t("phone") : t("memberQr")}</Title>
              <Button variant="subtle" onClick={() => setMethod(null)}>{t("changeMethod")}</Button>
            </Group>
            {method === "phone" ? (
              <TextInput
                label={t("phoneLabel")}
                placeholder={t("phonePlaceholder")}
                value={phone}
                onChange={(event) => setPhone(event.currentTarget.value)}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
              />
            ) : (
              <Card p="xl" radius="md" style={{ background: uiColors.brandPrimarySoft, border: "1px dashed " + uiColors.brandPrimary }}>
                <Stack align="center" gap="xs">
                  <IconQrcode size={56} color={uiColors.brandPrimary} />
                  <Text ta="center">{t("qrScanned")}</Text>
                </Stack>
              </Card>
            )}
            <NumberInput label={t("partySize")} min={1} max={20} value={partySize} onChange={setPartySize} />
            <PrimaryActionButton
              color="warmCoral"
              size="lg"
              disabled={!canConfirm}
              onClick={() => setTicket({ ...demoTicket, partySize: Number(partySize) || 1 })}
            >
              {t("confirm")}
            </PrimaryActionButton>
          </Stack>
        </SurfaceCard>
      )}
    </MobileShell>
  );
}

export function CustomerWaitlistScreen() {
  const t = useTranslations("Waitlist.ticket");
  const [status, setStatus] = useState<WaitlistStatus>("waiting");
  const ticket = status === "called" ? callWaitlistTicket(demoTicket) : demoTicket;

  return (
    <MobileShell title={t("title")} backHref="/" bottomNav={null}>
      <WaitlistTicketCard ticket={ticket} t={t} />
      <SegmentedControl
        aria-label={t("previewStatus")}
        value={status}
        onChange={(value) => setStatus(value as WaitlistStatus)}
        data={[
          { value: "waiting", label: t("waiting") },
          { value: "called", label: t("called") },
        ]}
        color="warmCoral"
      />
      <Button component={Link} href={"/restaurants/" + ticket.restaurantSlug} fullWidth variant="default" leftSection={<IconMapPin size={18} />}>
        {t("viewRestaurant")}
      </Button>
      <Text size="xs" c={uiColors.textMuted} ta="center">{t("mockNotice")}</Text>
    </MobileShell>
  );
}

function WaitlistTicketCard({
  ticket,
  t,
}: {
  ticket: WaitlistTicket;
  t: (key: string) => string;
}) {
  const called = ticket.status === "called";

  return (
    <Stack gap="md">
      <SurfaceCard tone={called ? "brand" : "default"} p="xl">
        <Stack align="center" gap="md">
          <ThemeIcon size={52} radius="xl" color={called ? "teal" : "warmCoral"}>
            <IconCheck size={28} />
          </ThemeIcon>
          <Stack align="center" gap={4}>
            <Text size="sm" c={uiColors.textSecondary}>{ticket.restaurantName}</Text>
            <Title order={1} size="3.4rem">{ticket.queueNumber}</Title>
          </Stack>
          <StatusBadge tone={called ? "success" : "warning"}>{t(called ? "called" : "waiting")}</StatusBadge>
          <Text ta="center" fw={700}>{t(called ? "calledTitle" : "waitingTitle")}</Text>
        </Stack>
      </SurfaceCard>
      <Card withBorder radius="lg" p="md">
        <Group justify="space-between">
          <Text c={uiColors.textSecondary}>{t("partySize")}</Text>
          <Text fw={800}>{ticket.partySize}</Text>
        </Group>
      </Card>
      {called ? <Text ta="center" c={uiColors.statusSuccessText} fw={700}>{t("calledHint")}</Text> : null}
    </Stack>
  );
}

