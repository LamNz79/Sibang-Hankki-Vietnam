"use client";

import { useState, type FormEvent } from "react";
import { Button, Group, Modal, PasswordInput, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconLock } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { changePassword } from "@/features/auth/data/session";
import { ApiError } from "@/lib/api/client";
import { uiColors } from "@/theme";

export function ChangePasswordButton() {
  const t = useTranslations("PasswordManagement.change");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const valid = currentPassword.length > 0
    && newPassword.length >= 8
    && newPassword.length <= 72
    && newPassword === confirmation;
  const mutation = useMutation({
    mutationFn: () => changePassword(currentPassword, newPassword),
    onSuccess: () => {
      queryClient.removeQueries();
      notifications.show({ color: "teal", message: t("success") });
      router.replace("/login");
      router.refresh();
    },
    onError: (error) => notifications.show({
      color: "red",
      message: error instanceof ApiError && error.status === 403
        ? t("wrongCurrent")
        : t("error"),
    }),
  });
  const dismiss = () => {
    if (mutation.isPending) return;
    close();
    setCurrentPassword("");
    setNewPassword("");
    setConfirmation("");
    mutation.reset();
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (valid) mutation.mutate();
  };

  return (
    <>
      <Button
        fullWidth
        variant="light"
        color="gray"
        leftSection={<IconLock size={18} />}
        onClick={open}
      >
        {t("action")}
      </Button>
      <Modal
        opened={opened}
        onClose={dismiss}
        title={t("title")}
        centered
        closeOnClickOutside={!mutation.isPending}
      >
        <form onSubmit={submit}>
          <Stack>
            <Text size="sm" c={uiColors.textSecondary}>{t("description")}</Text>
            <PasswordInput
              required
              autoComplete="current-password"
              label={t("currentPassword")}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.currentTarget.value)}
            />
            <PasswordInput
              required
              autoComplete="new-password"
              label={t("newPassword")}
              description={t("requirements")}
              value={newPassword}
              onChange={(event) => setNewPassword(event.currentTarget.value)}
              minLength={8}
              maxLength={72}
            />
            <PasswordInput
              required
              autoComplete="new-password"
              label={t("confirmPassword")}
              error={confirmation && confirmation !== newPassword ? t("mismatch") : undefined}
              value={confirmation}
              onChange={(event) => setConfirmation(event.currentTarget.value)}
              minLength={8}
              maxLength={72}
            />
            <Group justify="flex-end">
              <Button variant="default" disabled={mutation.isPending} onClick={dismiss}>
                {t("cancel")}
              </Button>
              <Button color="warmCoral" type="submit" loading={mutation.isPending} disabled={!valid}>
                {t("submit")}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
