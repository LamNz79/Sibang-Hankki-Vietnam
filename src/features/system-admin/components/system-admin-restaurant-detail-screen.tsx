"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Group,
  Loader,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconBuildingStore,
  IconCalendarEvent,
  IconClock,
  IconPlus,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui";
import type { BusinessHour } from "@/features/owner/settings/data/business-hours";
import type { ConfirmationMode } from "@/features/owner/settings/data/owner-settings";
import { RestaurantFormDialog } from "@/features/system-admin/components/restaurant-form-dialog";
import {
  getSystemAdminRestaurant,
  type SystemAdminRestaurantInput,
  updateSystemAdminRestaurant,
} from "@/features/system-admin/data/system-admin-directory";
import {
  getSystemAdminBookingSettings,
  getSystemAdminBusinessHours,
  regenerateSystemAdminRestaurantSlots,
  updateSystemAdminBookingSettings,
  updateSystemAdminBusinessHours,
  type SystemAdminBookingSettings,
} from "@/features/system-admin/data/system-admin-booking-configuration";
import { ApiError } from "@/lib/api/client";
import { uiColors } from "@/theme";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const numberValue = (value: string | number) => typeof value === "number" ? value : 0;
const defaultSettings: SystemAdminBookingSettings = {
  confirmationMode: "AUTO",
  manualConfirmationMinPartySize: null,
  guestCapacity: 20,
  slotIntervalMinutes: 60,
  diningDurationMinutes: 90,
  bookingWindowDays: 30,
  minimumPartySize: 2,
  maximumOnlinePartySize: 10,
  largePartyThreshold: 11,
  cancellationCutoffMinutes: 120,
  noShowGraceMinutes: 15,
};
const statusTones = {
  DRAFT: "neutral",
  PENDING: "warning",
  CHANGES_REQUESTED: "info",
  ACTIVE: "success",
  SUSPENDED: "error",
} as const;

export function SystemAdminRestaurantDetailScreen({ id }: { id: string }) {
  const t = useTranslations("SystemAdmin.restaurantDetail");
  const ownerT = useTranslations("OwnerSettings.page");
  const queryClient = useQueryClient();
  const [editingProfile, setEditingProfile] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState<SystemAdminBookingSettings | null>(null);
  const [hoursDraft, setHoursDraft] = useState<BusinessHour[] | null>(null);
  const restaurantQuery = useQuery({
    queryKey: ["system-admin-restaurant", id],
    queryFn: ({ signal }) => getSystemAdminRestaurant(id, signal),
    retry: false,
  });
  const settingsQuery = useQuery({
    queryKey: ["system-admin-restaurant-booking-settings", id],
    queryFn: ({ signal }) => getSystemAdminBookingSettings(id, signal),
    retry: false,
  });
  const hoursQuery = useQuery({
    queryKey: ["system-admin-restaurant-business-hours", id],
    queryFn: ({ signal }) => getSystemAdminBusinessHours(id, signal),
    retry: false,
  });
  const settingsMissing = settingsQuery.error instanceof ApiError
    && settingsQuery.error.status === 409;
  const hasSavedSettings = settingsQuery.data !== undefined;
  const settings = settingsDraft ?? settingsQuery.data ?? (settingsMissing ? defaultSettings : null);
  const hours = hoursDraft ?? hoursQuery.data ?? [];
  const profileMutation = useMutation({
    mutationFn: (input: SystemAdminRestaurantInput) => updateSystemAdminRestaurant(id, input),
    onSuccess: (restaurant) => {
      queryClient.setQueryData(["system-admin-restaurant", id], restaurant);
      setEditingProfile(false);
      notifications.show({ color: "teal", message: t("notifications.profileSaved") });
    },
    onError: () => notifications.show({ color: "red", message: t("notifications.profileError") }),
  });
  const settingsMutation = useMutation({
    mutationFn: (input: SystemAdminBookingSettings) => updateSystemAdminBookingSettings(id, input),
    onSuccess: (result) => {
      queryClient.setQueryData(["system-admin-restaurant-booking-settings", id], result);
      setSettingsDraft(null);
      notifications.show({ color: "teal", message: t("notifications.settingsSaved") });
    },
    onError: () => notifications.show({ color: "red", message: t("notifications.settingsError") }),
  });
  const hoursMutation = useMutation({
    mutationFn: (input: BusinessHour[]) => updateSystemAdminBusinessHours(id, input),
    onSuccess: (result) => {
      queryClient.setQueryData(["system-admin-restaurant-business-hours", id], result.hours);
      setHoursDraft(null);
      notifications.show({
        color: "teal",
        message: t("notifications.hoursSaved", { count: result.generatedSlots }),
      });
    },
    onError: () => notifications.show({ color: "red", message: t("notifications.hoursError") }),
  });
  const regenerateMutation = useMutation({
    mutationFn: () => regenerateSystemAdminRestaurantSlots(id),
    onSuccess: (result) => notifications.show({
      color: "teal",
      message: t("notifications.slotsGenerated", { count: result.generatedSlots }),
    }),
    onError: () => notifications.show({ color: "red", message: t("notifications.regenerateError") }),
  });

  if (restaurantQuery.isPending) {
    return <Group justify="center" py="xl"><Loader /></Group>;
  }
  if (restaurantQuery.isError || !restaurantQuery.data) {
    return <Alert color="red" title={t("loadError")} />;
  }
  const restaurant = restaurantQuery.data;
  const setSetting = <K extends keyof SystemAdminBookingSettings>(
    key: K,
    value: SystemAdminBookingSettings[K],
  ) => {
    if (!settings) return;
    setSettingsDraft((current) => ({ ...(current ?? settings), [key]: value }));
  };
  const updateHour = (index: number, key: "opensAt" | "closesAt", value: string) => {
    setHoursDraft(hours.map((hour, hourIndex) =>
      hourIndex === index ? { ...hour, [key]: value } : hour));
  };

  return (
    <Stack gap="xl">
      <Stack gap="sm">
        <Button
          component={Link}
          href="/system-admin/restaurants"
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
            <Title order={1}>{restaurant.name}</Title>
            <Text c={uiColors.textSecondary}>{restaurant.slug}</Text>
          </Stack>
          <StatusBadge tone={statusTones[restaurant.approvalStatus]}>
            {t(`statuses.${restaurant.approvalStatus}`)}
          </StatusBadge>
        </Group>
      </Stack>

      <Tabs defaultValue="profile" keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="profile" leftSection={<IconBuildingStore size={16} />}>
            {t("tabs.profile")}
          </Tabs.Tab>
          <Tabs.Tab value="booking" leftSection={<IconCalendarEvent size={16} />}>
            {t("tabs.booking")}
          </Tabs.Tab>
          <Tabs.Tab value="hours" leftSection={<IconClock size={16} />}>
            {t("tabs.hours")}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="profile" pt="lg">
          <SectionCard
            title={t("profile.title")}
            action={<Button size="xs" onClick={() => setEditingProfile(true)}>{t("profile.edit")}</Button>}
          >
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <Detail label={t("profile.cuisine")} value={restaurant.cuisineLabel} />
              <Detail label={t("profile.priceRange")} value={restaurant.priceRange} />
              <Detail label={t("profile.location")} value={[restaurant.wardName, restaurant.provinceName].filter(Boolean).join(", ")} />
              <Detail label={t("profile.timezone")} value={restaurant.timezone} />
              <Detail label={t("profile.phone")} value={restaurant.phone} />
              <Detail label={t("profile.email")} value={restaurant.email} />
            </SimpleGrid>
            <Detail label={t("profile.address")} value={restaurant.address} />
            <Detail label={t("profile.description")} value={restaurant.description} />
          </SectionCard>
        </Tabs.Panel>

        <Tabs.Panel value="booking" pt="lg">
          {settingsQuery.isPending ? (
            <Group justify="center"><Loader /></Group>
          ) : settingsQuery.isError && !settingsMissing ? (
            <Alert color="red" title={t("booking.loadError")} />
          ) : settings ? (
            <SectionCard title={ownerT("policy.title")}>
              {settingsMissing ? <Alert color="yellow">{t("booking.notConfigured")}</Alert> : null}
              <Select
                label={ownerT("policy.confirmationMode")}
                value={settings.confirmationMode}
                data={[
                  { value: "AUTO", label: ownerT("policy.modes.auto") },
                  { value: "MANUAL", label: ownerT("policy.modes.manual") },
                  { value: "HYBRID", label: ownerT("policy.modes.hybrid") },
                ]}
                onChange={(value) => {
                  const mode = (value ?? "AUTO") as ConfirmationMode;
                  setSettingsDraft({
                    ...settings,
                    confirmationMode: mode,
                    manualConfirmationMinPartySize: mode === "HYBRID"
                      ? (settings.manualConfirmationMinPartySize ?? settings.maximumOnlinePartySize)
                      : null,
                  });
                }}
              />
              {settings.confirmationMode === "HYBRID" ? (
                <NumberInput
                  label={ownerT("policy.manualFromPartySize")}
                  min={1}
                  value={settings.manualConfirmationMinPartySize ?? 1}
                  onChange={(value) => setSetting("manualConfirmationMinPartySize", numberValue(value))}
                />
              ) : null}
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <NumberInput label={ownerT("policy.guestCapacity")} min={1} value={settings.guestCapacity} onChange={(value) => setSetting("guestCapacity", numberValue(value))} />
                <NumberInput label={ownerT("policy.bookingWindow")} min={1} value={settings.bookingWindowDays} onChange={(value) => setSetting("bookingWindowDays", numberValue(value))} />
                <NumberInput label={ownerT("policy.slotInterval")} min={1} value={settings.slotIntervalMinutes} onChange={(value) => setSetting("slotIntervalMinutes", numberValue(value))} />
                <NumberInput label={ownerT("policy.diningDuration")} min={1} value={settings.diningDurationMinutes} onChange={(value) => setSetting("diningDurationMinutes", numberValue(value))} />
                <NumberInput label={ownerT("policy.minimumPartySize")} min={1} value={settings.minimumPartySize} onChange={(value) => setSetting("minimumPartySize", numberValue(value))} />
                <NumberInput label={ownerT("policy.maximumOnlineParty")} min={1} value={settings.maximumOnlinePartySize} onChange={(value) => setSetting("maximumOnlinePartySize", numberValue(value))} />
                <NumberInput label={ownerT("policy.largePartyThreshold")} min={1} value={settings.largePartyThreshold} onChange={(value) => setSetting("largePartyThreshold", numberValue(value))} />
                <NumberInput
                  label={ownerT("policy.cancellationCutoff")}
                  min={0}
                  value={settings.cancellationCutoffMinutes ?? ""}
                  onChange={(value) => setSetting("cancellationCutoffMinutes", value === "" ? null : numberValue(value))}
                />
                <NumberInput
                  label={ownerT("policy.noShowGrace")}
                  description={ownerT("policy.noShowGraceDescription")}
                  min={0}
                  value={settings.noShowGraceMinutes ?? ""}
                  onChange={(value) => setSetting("noShowGraceMinutes", value === "" ? null : numberValue(value))}
                />
              </SimpleGrid>
              <Group justify="flex-end">
                <Button
                  loading={settingsMutation.isPending}
                  disabled={!settingsDraft && !settingsMissing}
                  onClick={() => settingsMutation.mutate(settings)}
                >
                  {t("booking.save")}
                </Button>
              </Group>
            </SectionCard>
          ) : null}
        </Tabs.Panel>

        <Tabs.Panel value="hours" pt="lg">
          <SectionCard
            title={ownerT("hours.title")}
            action={(
              <Button
                variant="light"
                leftSection={<IconRefresh size={16} />}
                loading={regenerateMutation.isPending}
                disabled={!hasSavedSettings}
                onClick={() => regenerateMutation.mutate()}
              >
                {ownerT("policy.regenerate")}
              </Button>
            )}
          >
            {settingsQuery.isError && !settingsMissing ? (
              <Alert color="red">{t("booking.loadError")}</Alert>
            ) : !hasSavedSettings ? (
              <Alert color="yellow">{t("hours.saveSettingsFirst")}</Alert>
            ) : null}
            {hoursQuery.isPending ? (
              <Group justify="center"><Loader size="sm" /></Group>
            ) : hoursQuery.isError ? (
              <Alert color="red">{t("hours.loadError")}</Alert>
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
                        <Text fw={700} size="sm">{ownerT(`hours.days.${day}`)}</Text>
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
                          {ownerT("hours.addPeriod")}
                        </Button>
                      </Group>
                      {periods.length === 0 ? (
                        <Text size="xs" c={uiColors.textMuted}>{ownerT("hours.closed")}</Text>
                      ) : periods.map(({ hour, index }) => (
                        <Group key={`${dayNumber}-${index}`} grow align="flex-end">
                          <TextInput type="time" label={ownerT("hours.opens")} value={hour.opensAt.slice(0, 5)} onChange={(event) => updateHour(index, "opensAt", event.currentTarget.value)} />
                          <TextInput type="time" label={ownerT("hours.closes")} value={hour.closesAt.slice(0, 5)} onChange={(event) => updateHour(index, "closesAt", event.currentTarget.value)} />
                          <ActionIcon
                            variant="light"
                            color="red"
                            size={36}
                            aria-label={ownerT("hours.removePeriod", { day: ownerT(`hours.days.${day}`) })}
                            onClick={() => setHoursDraft(hours.filter((_, hourIndex) => hourIndex !== index))}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      ))}
                    </Stack>
                  );
                })}
                <Group justify="flex-end">
                  <Button
                    loading={hoursMutation.isPending}
                    disabled={!hasSavedSettings || hoursDraft === null}
                    onClick={() => hoursMutation.mutate(hours)}
                  >
                    {ownerT("hours.save")}
                  </Button>
                </Group>
              </Stack>
            )}
          </SectionCard>
        </Tabs.Panel>
      </Tabs>

      <RestaurantFormDialog
        key={`${restaurant.id}:${restaurant.updatedAt}`}
        opened={editingProfile}
        restaurant={restaurant}
        editing
        loading={false}
        loadError={false}
        saving={profileMutation.isPending}
        onClose={() => {
          if (!profileMutation.isPending) setEditingProfile(false);
        }}
        onSubmit={(input) => profileMutation.mutate(input)}
      />
    </Stack>
  );
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card withBorder radius="sm" p="lg">
      <Stack gap="lg">
        <Group justify="space-between"><Text fw={800}>{title}</Text>{action}</Group>
        {children}
      </Stack>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <Stack gap={2}>
      <Text size="xs" c={uiColors.textSecondary}>{label}</Text>
      <Text size="sm" fw={650}>{value || "-"}</Text>
    </Stack>
  );
}
