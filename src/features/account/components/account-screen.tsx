"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ActionIcon,
  Alert,
  Avatar,
  Box,
  Button,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconCalendarEvent,
  IconChevronRight,
  IconClock,
  IconCoin,
  IconHeart,
  IconHistory,
  IconLogout,
  IconMap2,
  IconSettings,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { BottomNav, MobileShell } from "@/components/layout/customer";
import { SurfaceCard, WorkspaceSwitcher } from "@/components/ui";
import {
  getCustomerProfile,
  updateCustomerProfile,
  type CustomerProfileUpdate,
} from "@/features/account/data/customer-profile";
import { logout } from "@/features/auth/data/session";
import { LanguageSelect } from "@/features/i18n";
import { useCustomerReservations } from "@/features/reservations/hooks/use-customer-reservations";
import { ApiError } from "@/lib/api/client";
import { uiColors } from "@/theme";

/** Configuration accepted by a row in the customer account menu. */
type AccountMenuItemProps = {
  href?: string;
  icon: Icon;
  iconBackground: string;
  iconColor: string;
  label: string;
  meta?: string;
};

/** Renders a linked or disabled account action with consistent visual treatment. */
function AccountMenuItem({
  href,
  icon: MenuIcon,
  iconBackground,
  iconColor,
  label,
  meta,
}: AccountMenuItemProps) {
  const content = (
    <Group gap="sm" wrap="nowrap" py="sm">
      <ThemeIcon
        size={36}
        radius="md"
        variant="filled"
        style={{
          flexShrink: 0,
          background: iconBackground,
          color: iconColor,
        }}
      >
        <MenuIcon size={18} />
      </ThemeIcon>

      <Text
        size="sm"
        fw={700}
        c={uiColors.textPrimary}
        style={{ flex: 1 }}
      >
        {label}
      </Text>

      {meta ? (
        <Text size="xs" c={uiColors.textSecondary}>
          {meta}
        </Text>
      ) : null}
      <IconChevronRight size={16} color={uiColors.textMuted} />
    </Group>
  );

  if (!href) {
    return (
      <UnstyledButton
        w="100%"
        disabled
        title={`${label} will be available in a later prototype`}
        style={{ opacity: 1, cursor: "default" }}
      >
        {content}
      </UnstyledButton>
    );
  }

  return (
    <Link href={href} style={{ color: "inherit", textDecoration: "none" }}>
      {content}
    </Link>
  );
}

/** Customer profile overview with reservation summary and account navigation. */
export function AccountScreen() {
  const t = useTranslations("Account");
  const router = useRouter();
  const queryClient = useQueryClient();
  const reservations = useCustomerReservations();
  const [editorOpened, editor] = useDisclosure(false);
  const [draft, setDraft] = useState<CustomerProfileUpdate>({
    name: "",
    email: "",
    phone: null,
  });
  const profileQuery = useQuery({
    queryKey: ["customer-profile"],
    queryFn: ({ signal }) => getCustomerProfile(signal),
    retry: false,
  });
  const saveProfile = useMutation({
    mutationFn: updateCustomerProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(["customer-profile"], profile);
      editor.close();
      notifications.show({ color: "teal", message: t("saved") });
    },
    onError: () => notifications.show({ color: "red", message: t("saveError") }),
  });
  const signOut = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries();
      router.push("/login");
      router.refresh();
    },
    onError: () => notifications.show({ color: "red", message: t("logoutError") }),
  });
  const profile = profileQuery.data;
  const requiresLogin =
    profileQuery.error instanceof ApiError &&
    (profileQuery.error.status === 401 || profileQuery.error.status === 403);
  const openEditor = () => {
    if (!profile) return;
    setDraft({ name: profile.name, email: profile.email, phone: profile.phone });
    editor.open();
  };
  const initials = profile?.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <MobileShell
      title={t("title")}
      subtitle={t("subtitle")}
      headerAction={
        <Tooltip label={t("editProfile")} position="bottom-end">
          <ActionIcon
            variant="light"
            color="gray"
            radius="xl"
            size={38}
            aria-label={t("editProfile")}
            disabled={!profile}
            onClick={openEditor}
          >
            <IconSettings size={19} />
          </ActionIcon>
        </Tooltip>
      }
      bottomNav={<BottomNav activePath="/my" />}
    >
      <Modal opened={editorOpened} onClose={editor.close} title={t("editProfile")} centered>
        <Stack>
          <TextInput
            label={t("name")}
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.currentTarget.value })}
            maxLength={120}
            required
          />
          <TextInput
            type="email"
            label={t("email")}
            value={draft.email}
            onChange={(event) => setDraft({ ...draft, email: event.currentTarget.value })}
            maxLength={320}
            required
          />
          <TextInput
            type="tel"
            label={t("phone")}
            value={draft.phone ?? ""}
            onChange={(event) => setDraft({ ...draft, phone: event.currentTarget.value || null })}
            maxLength={30}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={editor.close}>{t("cancel")}</Button>
            <Button
              color="warmCoral"
              loading={saveProfile.isPending}
              disabled={!draft.name.trim() || !draft.email.trim()}
              onClick={() => saveProfile.mutate(draft)}
            >
              {t("save")}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <SurfaceCard p="md">
        {profileQuery.isLoading ? (
          <Group justify="center"><Loader size="sm" /></Group>
        ) : profile ? (
          <UnstyledButton w="100%" onClick={openEditor} aria-label={t("editProfile")}>
            <Group gap="md" wrap="nowrap">
              <Avatar
                size={54}
                radius="xl"
                color="warmCoral"
                variant="light"
                styles={{ placeholder: { fontWeight: 800 } }}
              >
                {initials}
              </Avatar>
              <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                <Text fw={800} c={uiColors.textPrimary}>{profile.name}</Text>
                <Text size="xs" c={uiColors.textSecondary}>@{profile.userid}</Text>
              </Stack>
              <IconChevronRight size={18} color={uiColors.textMuted} />
            </Group>
          </UnstyledButton>
        ) : (
          <Alert color={requiresLogin ? "blue" : "red"} title={t(requiresLogin ? "loginRequired" : "loadError")}>
            <Button component={Link} href="/login" variant="light" mt="sm">
              {t("login")}
            </Button>
          </Alert>
        )}
      </SurfaceCard>

      <SurfaceCard tone="brand" p="md">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon
            size={38}
            radius="md"
            color="warmCoral"
            variant="light"
          >
            <IconCoin size={19} />
          </ThemeIcon>
          <Text size="sm" c={uiColors.textSecondary}>
            Dining points
          </Text>
          <Text fw={850} size="lg" c={uiColors.brandPrimary}>
            420
          </Text>
          <Box style={{ flex: 1 }} />
          <Text size="xs" fw={700} c={uiColors.brandPrimary}>
            History
          </Text>
          <IconChevronRight size={16} color={uiColors.brandPrimary} />
        </Group>
      </SurfaceCard>

      <SurfaceCard px="md" py={0}>
        <AccountMenuItem
          href="/reservations"
          icon={IconCalendarEvent}
          iconBackground={uiColors.detailDateSurface}
          iconColor={uiColors.detailDateText}
          label="My reservations"
          meta={`${reservations.length} upcoming`}
        />
        <Box h={1} ml={48} bg={uiColors.border} />
        <AccountMenuItem
          icon={IconHeart}
          iconBackground={uiColors.accentVipSurface}
          iconColor={uiColors.accentVipText}
          label="Saved restaurants"
          meta="8"
        />
        <Box h={1} ml={48} bg={uiColors.border} />
        <AccountMenuItem
          icon={IconMap2}
          iconBackground={uiColors.detailRequestSurface}
          iconColor={uiColors.detailRequestText}
          label="My dining map"
          meta="12 saved"
        />
        <Box h={1} ml={48} bg={uiColors.border} />
        <AccountMenuItem
          icon={IconHistory}
          iconBackground={uiColors.detailPreOrderSurface}
          iconColor={uiColors.detailPreOrderText}
          label="Visit history"
          meta="Write a review"
        />
      </SurfaceCard>

      <SurfaceCard p="md">
        <LanguageSelect />
      </SurfaceCard>

      {profile ? (
        <Button
          variant="light"
          color="red"
          leftSection={<IconLogout size={18} />}
          loading={signOut.isPending}
          onClick={() => signOut.mutate()}
        >
          {t("logout")}
        </Button>
      ) : null}

      <Stack gap="sm">
        <Text fw={800} size="lg" c={uiColors.textPrimary}>
          Recent visit
        </Text>
        <Link
          href="/restaurants/royal-pavilion"
          style={{ color: "inherit", textDecoration: "none" }}
        >
          <SurfaceCard p="sm">
            <Group gap="sm" wrap="nowrap">
              <Box
                w={68}
                h={58}
                style={{
                  flexShrink: 0,
                  borderRadius: 12,
                  background: `repeating-linear-gradient(135deg, ${uiColors.brandPrimarySoft} 0 8px, #ffffff 8px 16px)`,
                }}
              />
              <Stack gap={3} style={{ flex: 1, minWidth: 0 }}>
                <Text fw={750} size="sm" c={uiColors.textPrimary}>
                  The Royal Pavilion
                </Text>
                <Group gap={5} wrap="nowrap">
                  <IconClock size={14} color={uiColors.textSecondary} />
                  <Text size="xs" c={uiColors.textSecondary}>
                    1 visit · Review available
                  </Text>
                </Group>
              </Stack>
              <IconChevronRight size={17} color={uiColors.textMuted} />
            </Group>
          </SurfaceCard>
        </Link>
      </Stack>

      <SurfaceCard tone="brand" p="md">
        <WorkspaceSwitcher />
      </SurfaceCard>
    </MobileShell>
  );
}
