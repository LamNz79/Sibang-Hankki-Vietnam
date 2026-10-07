"use client";

import { useState, type ReactNode } from "react";
import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBuildingStore,
  IconCalendarEvent,
  IconClock,
  IconInfoCircle,
  IconHelpCircle,
  IconPlus,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { LanguageSelect } from "@/features/i18n";
import { useTranslations } from "next-intl";
import { OwnerShell } from "@/features/owner/shared";
import {
  type ConfirmationMode,
  type OwnerSettings,
  type OwnerSettingsUpdate,
} from "@/features/owner/settings/data/owner-settings";
import { useOwnerSettings } from "@/features/owner/settings/hooks/use-owner-settings";
import { useBusinessHours } from "@/features/owner/settings/hooks/use-business-hours";
import type { BusinessHour } from "@/features/owner/settings/data/business-hours";
import { PrimaryActionButton, WorkspaceSwitcher } from "@/components/ui";
import { uiColors } from "@/theme";

const numberValue = (value: string | number) =>
  typeof value === "number" ? value : 0;
const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const renderBold = {
  b: (chunks: ReactNode) => <b>{chunks}</b>,
};

const editableSettings = (settings: OwnerSettings): OwnerSettingsUpdate => ({
  name: settings.name,
  description: settings.description,
  cuisineLabel: settings.cuisineLabel,
  area: settings.area,
  district: settings.district,
  address: settings.address,
  phone: settings.phone,
  email: settings.email,
  priceRange: settings.priceRange,
  guestCapacity: settings.guestCapacity,
  bookingIntervalMinutes: settings.bookingIntervalMinutes,
  diningDurationMinutes: settings.diningDurationMinutes,
  confirmationMode: settings.confirmationMode,
  manualConfirmationMinPartySize: settings.manualConfirmationMinPartySize,
  bookingWindowDays: settings.bookingWindowDays,
  minimumPartySize: settings.minimumPartySize,
  maximumOnlinePartySize: settings.maximumOnlinePartySize,
  largePartyThreshold: settings.largePartyThreshold,
  customerCancellationCutoffMinutes: settings.customerCancellationCutoffMinutes,
});

function SectionCard({
  title,
  icon: Icon,
  headerAction,
  children,
}: {
  title: string;
  icon: typeof IconBuildingStore;
  headerAction?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card
      radius="lg"
      p="md"
      style={{
        background: uiColors.surface,
        border: `1px solid ${uiColors.border}`,
      }}
    >
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="sm">
            <ThemeIcon size={36} radius="md" variant="light" color="warmCoral">
              <Icon size={18} />
            </ThemeIcon>
            <Text fw={800}>{title}</Text>
          </Group>
          {headerAction}
        </Group>
        {children}
      </Stack>
    </Card>
  );
}

export function OwnerSettingsScreen() {
  const { query, mutation } = useOwnerSettings();
  const businessHours = useBusinessHours();
  const t = useTranslations("OwnerSettings.bookingSlotsModal");
  const pageT = useTranslations("OwnerSettings.page");
  const [draft, setDraft] = useState<OwnerSettingsUpdate | null>(null);
  const [hoursDraft, setHoursDraft] = useState<BusinessHour[] | null>(null);
  const [helpOpened, setHelpOpened] = useState(false);
  const form = draft ?? (query.data ? editableSettings(query.data) : null);
  const hours = hoursDraft ?? businessHours.query.data ?? [];

  const set = <K extends keyof OwnerSettingsUpdate>(
    key: K,
    value: OwnerSettingsUpdate[K],
  ) => {
    if (!form) return;
    setDraft((current) => ({ ...(current ?? form), [key]: value }));
  };

  const save = async () => {
    if (!form) return;
    try {
      await mutation.mutateAsync(form);
      setDraft(null);
      notifications.show({ color: "teal", message: pageT("notifications.settingsSaved") });
    } catch {
      notifications.show({
        color: "red",
        message: pageT("notifications.settingsSaveError"),
      });
    }
  };

  const saveHours = async () => {
    try {
      const result = await businessHours.updateMutation.mutateAsync(hours);
      setHoursDraft(null);
      notifications.show({
        color: "teal",
        message: pageT("notifications.hoursSaved", { count: result.generatedSlots }),
      });
    } catch {
      notifications.show({ color: "red", message: pageT("notifications.hoursSaveError") });
    }
  };

  const regenerate = async () => {
    try {
      const result = await businessHours.regenerateMutation.mutateAsync();
      notifications.show({
        color: "teal",
        message: pageT("notifications.slotsGenerated", { count: result.generatedSlots }),
      });
    } catch {
      notifications.show({ color: "red", message: pageT("notifications.regenerateError") });
    }
  };

  const updateHour = (index: number, key: "opensAt" | "closesAt", value: string) => {
    setHoursDraft(hours.map((hour, hourIndex) =>
      hourIndex === index ? { ...hour, [key]: value } : hour));
  };

  return (
    <OwnerShell
      title={pageT("title")}
      eyebrow={query.data?.slug ?? pageT("eyebrow")}
      backHref="/owner"
      hideMobileNavigation
      footerAction={
        <PrimaryActionButton
          onClick={save}
          loading={mutation.isPending}
          disabled={!form || query.isLoading}
        >
          {pageT("saveChanges")}
        </PrimaryActionButton>
      }
    >
      {query.isLoading ? (
        <Group justify="center" py="xl"><Loader /></Group>
      ) : query.isError || !form ? (
        <Alert color="red" title={pageT("unavailable.title")}>
          {pageT("unavailable.description")}
        </Alert>
      ) : (
        <Stack gap="md">
          <SectionCard title={pageT("profile.title")} icon={IconBuildingStore}>
            <TextInput
              label={pageT("profile.name")}
              required
              value={form.name}
              onChange={(event) => set("name", event.currentTarget.value)}
            />
            <Textarea
              label={pageT("profile.description")}
              minRows={3}
              value={form.description ?? ""}
              onChange={(event) => set("description", event.currentTarget.value || null)}
            />
            <SimpleGrid cols={2}>
              <TextInput label={pageT("profile.cuisine")} value={form.cuisineLabel ?? ""} onChange={(event) => set("cuisineLabel", event.currentTarget.value || null)} />
              <TextInput label={pageT("profile.priceRange")} placeholder="$$$" value={form.priceRange ?? ""} onChange={(event) => set("priceRange", event.currentTarget.value || null)} />
              <TextInput label={pageT("profile.area")} value={form.area ?? ""} onChange={(event) => set("area", event.currentTarget.value || null)} />
              <TextInput label={pageT("profile.district")} value={form.district ?? ""} onChange={(event) => set("district", event.currentTarget.value || null)} />
            </SimpleGrid>
            <Textarea label={pageT("profile.address")} minRows={2} value={form.address ?? ""} onChange={(event) => set("address", event.currentTarget.value || null)} />
            <SimpleGrid cols={2}>
              <TextInput label={pageT("profile.phone")} value={form.phone ?? ""} onChange={(event) => set("phone", event.currentTarget.value || null)} />
              <TextInput label={pageT("profile.email")} type="email" value={form.email ?? ""} onChange={(event) => set("email", event.currentTarget.value || null)} />
            </SimpleGrid>
          </SectionCard>

          <SectionCard title={pageT("policy.title")} icon={IconCalendarEvent}>
            <Select
              label={pageT("policy.confirmationMode")}
              value={form.confirmationMode}
              data={[
                { value: "AUTO", label: pageT("policy.modes.auto") },
                { value: "MANUAL", label: pageT("policy.modes.manual") },
                { value: "HYBRID", label: pageT("policy.modes.hybrid") },
              ]}
              onChange={(value) => {
                const mode = (value ?? "AUTO") as ConfirmationMode;
                setDraft((current) => ({
                  ...(current ?? form),
                  confirmationMode: mode,
                  manualConfirmationMinPartySize: mode === "HYBRID"
                    ? ((current ?? form).manualConfirmationMinPartySize ?? form.maximumOnlinePartySize)
                    : null,
                }));
              }}
            />
            {form.confirmationMode === "HYBRID" ? (
              <NumberInput
                label={pageT("policy.manualFromPartySize")}
                min={1}
                value={form.manualConfirmationMinPartySize ?? 1}
                onChange={(value) => set("manualConfirmationMinPartySize", numberValue(value))}
              />
            ) : null}
            <SimpleGrid cols={2}>
              <NumberInput label={pageT("policy.guestCapacity")} min={1} value={form.guestCapacity} onChange={(value) => set("guestCapacity", numberValue(value))} />
              <NumberInput label={pageT("policy.bookingWindow")} min={1} value={form.bookingWindowDays} onChange={(value) => set("bookingWindowDays", numberValue(value))} />
              <NumberInput label={pageT("policy.slotInterval")} min={1} value={form.bookingIntervalMinutes} onChange={(value) => set("bookingIntervalMinutes", numberValue(value))} />
              <NumberInput label={pageT("policy.diningDuration")} min={1} value={form.diningDurationMinutes} onChange={(value) => set("diningDurationMinutes", numberValue(value))} />
              <NumberInput label={pageT("policy.minimumPartySize")} min={1} value={form.minimumPartySize} onChange={(value) => set("minimumPartySize", numberValue(value))} />
              <NumberInput label={pageT("policy.maximumOnlineParty")} min={1} value={form.maximumOnlinePartySize} onChange={(value) => set("maximumOnlinePartySize", numberValue(value))} />
              <NumberInput label={pageT("policy.largePartyThreshold")} min={1} value={form.largePartyThreshold} onChange={(value) => set("largePartyThreshold", numberValue(value))} />
              <NumberInput
                label={pageT("policy.cancellationCutoff")}
                min={0}
                value={form.customerCancellationCutoffMinutes ?? ""}
                onChange={(value) => set(
                  "customerCancellationCutoffMinutes",
                  value === "" ? null : numberValue(value),
                )}
              />
            </SimpleGrid>
            <Alert icon={<IconInfoCircle size={18} />} color="blue">
              {pageT("policy.regenerateNotice")}
            </Alert>
            <Button
              variant="light"
              color="warmCoral"
              leftSection={<IconRefresh size={16} />}
              loading={businessHours.regenerateMutation.isPending}
              onClick={regenerate}
            >
              {pageT("policy.regenerate")}
            </Button>
          </SectionCard>

          <SectionCard
            title={pageT("hours.title")}
            icon={IconClock}
            headerAction={(
              <ActionIcon
                variant="subtle"
                color="gray"
                aria-label={t("triggerAria")}
                onClick={() => setHelpOpened(true)}
              >
                <IconHelpCircle size={20} />
              </ActionIcon>
            )}
          >
            {businessHours.query.isLoading ? (
              <Group justify="center"><Loader size="sm" /></Group>
            ) : businessHours.query.isError ? (
              <Alert color="red">{pageT("hours.loadError")}</Alert>
            ) : (
              <Stack gap="lg">
                {days.map((day, dayIndex) => {
                  const dayNumber = dayIndex + 1;
                  const periods = hours
                    .map((hour, index) => ({ hour, index }))
                    .filter(({ hour }) => hour.dayOfWeek === dayNumber);
                  return (
                    <Stack key={day} gap="xs">
                      <Group justify="space-between">
                        <Text fw={700} size="sm">{pageT(`hours.days.${day}`)}</Text>
                        <Button
                          size="compact-xs"
                          variant="subtle"
                          leftSection={<IconPlus size={14} />}
                          onClick={() => setHoursDraft([...hours, {
                            dayOfWeek: dayNumber,
                            opensAt: "11:30",
                            closesAt: "22:00",
                          }])}
                        >
                          {pageT("hours.addPeriod")}
                        </Button>
                      </Group>
                      {periods.length === 0 ? (
                        <Text size="xs" c={uiColors.textMuted}>{pageT("hours.closed")}</Text>
                      ) : periods.map(({ hour, index }) => (
                        <Group key={`${dayNumber}-${index}`} grow align="flex-end">
                          <TextInput
                            type="time"
                            label={pageT("hours.opens")}
                            value={hour.opensAt.slice(0, 5)}
                            onChange={(event) => updateHour(index, "opensAt", event.currentTarget.value)}
                          />
                          <TextInput
                            type="time"
                            label={pageT("hours.closes")}
                            value={hour.closesAt.slice(0, 5)}
                            onChange={(event) => updateHour(index, "closesAt", event.currentTarget.value)}
                          />
                          <ActionIcon
                            variant="light"
                            color="red"
                            size={36}
                            aria-label={pageT("hours.removePeriod", { day: pageT(`hours.days.${day}`) })}
                            onClick={() => setHoursDraft(hours.filter((_, hourIndex) => hourIndex !== index))}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      ))}
                    </Stack>
                  );
                })}
                <Button
                  variant="light"
                  color="warmCoral"
                  loading={businessHours.updateMutation.isPending}
                  onClick={saveHours}
                >
                  {pageT("hours.save")}
                </Button>
              </Stack>
            )}
          </SectionCard>

          <Modal
            opened={helpOpened}
            onClose={() => setHelpOpened(false)}
            title={<Text fw={800}>{t("title")}</Text>}
            centered
            radius="lg"
          >
            <Stack gap="md">
              <Text size="sm">
                {t("intro")}
              </Text>
              <Stack gap="xs">
                <Text fw={700}>{t("settingsMeaningTitle")}</Text>
                <Text size="sm">{t.rich("businessHours", renderBold)}</Text>
                <Text size="sm">{t.rich("bookingWindow", renderBold)}</Text>
                <Text size="sm">{t.rich("slotInterval", renderBold)}</Text>
                <Text size="sm">{t.rich("diningDuration", renderBold)}</Text>
                <Text size="sm">{t.rich("guestCapacity", renderBold)}</Text>
              </Stack>
              <Alert color="blue" title={t("exampleTitle")}>
                {t("exampleDescription")}
              </Alert>
              <Stack gap="xs">
                <Text fw={700}>{t("whenToRegenerateTitle")}</Text>
                <Text size="sm">{t.rich("regenerateNotice", renderBold)}</Text>
                <Text size="sm">{t("existingReservationsNotice")}</Text>
              </Stack>
            </Stack>
          </Modal>

          <Card
            radius="lg"
            p="md"
            style={{
              background: uiColors.surface,
              border: `1px solid ${uiColors.border}`,
            }}
          >
            <Stack gap="md"><LanguageSelect /><WorkspaceSwitcher /></Stack>
          </Card>
        </Stack>
      )}
    </OwnerShell>
  );
}
