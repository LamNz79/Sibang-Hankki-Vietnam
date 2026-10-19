"use client";

import { useState, type FormEvent } from "react";
import { Button, Group, Modal, PasswordInput, Stack, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import type { SystemAdminUser } from "@/features/system-admin/data/system-admin-directory";
import { uiColors } from "@/theme";

type Props = {
  user: SystemAdminUser;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (newPassword: string) => void;
};

export function ResetPasswordDialog({ user, submitting, onClose, onSubmit }: Props) {
  const t = useTranslations("PasswordManagement.reset");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const valid = password.length >= 8 && password.length <= 72 && password === confirmation;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (valid) onSubmit(password);
  };

  return (
    <Modal
      opened
      onClose={onClose}
      title={t("title", { name: user.name })}
      centered
      closeOnClickOutside={!submitting}
    >
      <form onSubmit={submit}>
        <Stack>
          <Text size="sm" c={uiColors.textSecondary}>{t("description")}</Text>
          <PasswordInput
            required
            autoComplete="new-password"
            label={t("newPassword")}
            description={t("requirements")}
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            minLength={8}
            maxLength={72}
          />
          <PasswordInput
            required
            autoComplete="new-password"
            label={t("confirmPassword")}
            error={confirmation && confirmation !== password ? t("mismatch") : undefined}
            value={confirmation}
            onChange={(event) => setConfirmation(event.currentTarget.value)}
            minLength={8}
            maxLength={72}
          />
          <Group justify="flex-end">
            <Button variant="default" disabled={submitting} onClick={onClose}>{t("cancel")}</Button>
            <Button color="warmCoral" type="submit" loading={submitting} disabled={!valid}>
              {t("submit")}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
