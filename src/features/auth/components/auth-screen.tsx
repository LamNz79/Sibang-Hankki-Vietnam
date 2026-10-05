"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft, IconToolsKitchen3 } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { login } from "@/features/auth/data/session";
import { LanguageSelect } from "@/features/i18n";
import { uiColors, uiShadows } from "@/theme";

type AuthMode = "login" | "signUp";

/** Prototype-only account form shared by Login and Sign Up routes. */
export function AuthScreen({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const t = useTranslations("Auth");
  const isSignUp = mode === "signUp";
  const alternateHref = isSignUp ? "/login" : "/sign-up";
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSignUp) {
      const form = new FormData(event.currentTarget);
      setSubmitting(true);
      try {
        const user = await login(
          String(form.get("userid") ?? ""),
          String(form.get("password") ?? ""),
        );
        router.push(
          user.role === "OWNER" || user.role === "STAFF" ? "/owner" : "/",
        );
      } catch {
        notifications.show({
          color: "red",
          title: t("login.errorTitle"),
          message: t("login.errorMessage"),
        });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    notifications.show({
      color: "teal",
      title: t(`${mode}.successTitle`),
      message: t(`${mode}.successMessage`),
    });
    router.push(isSignUp ? "/login" : "/");
  };

  return (
    <Box mih="100dvh" bg={uiColors.appBackground} px="md" py="xl">
      <Stack gap="xl" maw={440} mx="auto">
        <Group justify="space-between">
          <Button
            component={Link}
            href="/"
            variant="subtle"
            color="gray"
            px={0}
            leftSection={<IconArrowLeft size={18} />}
          >
            {t("backHome")}
          </Button>
          <LanguageSelect compact />
        </Group>

        <Card
          radius="xl"
          p={{ base: "lg", sm: "xl" }}
          style={{
            border: `1px solid ${uiColors.border}`,
            boxShadow: uiShadows.soft,
          }}
        >
          <Stack gap="lg">
            <Stack gap="sm" align="center">
              <ThemeIcon size={52} radius="xl" color="warmCoral" variant="light">
                <IconToolsKitchen3 size={25} />
              </ThemeIcon>
              <Stack gap={4} align="center">
                <Title order={1} size="h2" ta="center" c={uiColors.textPrimary}>
                  {t(`${mode}.title`)}
                </Title>
                <Text size="sm" ta="center" c={uiColors.textSecondary}>
                  {t(`${mode}.subtitle`)}
                </Text>
              </Stack>
            </Stack>

            <Alert color="blue" radius="md">
              {isSignUp ? t("prototypeNotice") : t("login.sessionNotice")}
            </Alert>

            <Box component="form" onSubmit={submit}>
              <Stack gap="md">
                {isSignUp ? (
                  <TextInput
                    name="fullName"
                    label={t("fields.fullName")}
                    placeholder={t("fields.fullNamePlaceholder")}
                    autoComplete="name"
                    required
                  />
                ) : null}
                {isSignUp ? (
                  <TextInput
                    name="email"
                    type="email"
                    label={t("fields.email")}
                    placeholder={t("fields.emailPlaceholder")}
                    autoComplete="email"
                    required
                  />
                ) : (
                  <TextInput
                    name="userid"
                    label={t("fields.userid")}
                    placeholder={t("fields.useridPlaceholder")}
                    autoComplete="username"
                    required
                  />
                )}
                <PasswordInput
                  name="password"
                  label={t("fields.password")}
                  placeholder={t("fields.passwordPlaceholder")}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  minLength={8}
                  required
                />
                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  radius="md"
                  color="warmCoral"
                  loading={submitting}
                >
                  {t(`${mode}.submit`)}
                </Button>
              </Stack>
            </Box>

            <Group justify="center" gap={6}>
              <Text size="sm" c={uiColors.textSecondary}>
                {t(`${mode}.alternatePrompt`)}
              </Text>
              <Button
                component={Link}
                href={alternateHref}
                variant="subtle"
                color="warmCoral"
                size="compact-sm"
                px={4}
              >
                {t(`${mode}.alternateAction`)}
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}
