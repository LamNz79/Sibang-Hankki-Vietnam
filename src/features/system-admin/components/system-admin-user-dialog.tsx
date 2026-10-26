"use client";

import { useState, type FormEvent } from "react";
import { Button, Group, Modal, PasswordInput, Stack, Text, TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import type {
  SystemAdminUser,
  SystemAdminUserCreateInput,
  SystemAdminUserUpdateInput,
} from "@/features/system-admin/data/system-admin-directory";
import { uiColors } from "@/theme";
import { useAccountPreferences, accountAccentColor } from "./account-preferences-context";

type Props = {
  user: SystemAdminUser | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (input: SystemAdminUserCreateInput | SystemAdminUserUpdateInput) => void;
};

export function SystemAdminUserDialog({ user, submitting, onClose, onSubmit }: Props) {
  const t = useTranslations("SystemAdmin.users.form");
  const preferences = useAccountPreferences();
  const accentColor = accountAccentColor(preferences.themeColor);
  const [userid, setUserid] = useState(user?.userid ?? "");
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [password, setPassword] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const profile = { name: name.trim(), email: email.trim(), phone: phone.trim() };
    onSubmit(user ? profile : { ...profile, userid: userid.trim(), password });
  };

  return (
    <Modal
      opened
      onClose={onClose}
      title={user ? t("editTitle") : t("createTitle")}
      centered
      closeOnClickOutside={!submitting}
    >
      <form onSubmit={submit}>
        <Stack>
          <Text size="sm" c={uiColors.textSecondary}>{t("description")}</Text>
          <TextInput
            required
            disabled={user !== null}
            label={t("userid")}
            description={t("useridHint")}
            placeholder={t("placeholders.userid")}
            value={userid}
            onChange={(event) => setUserid(event.currentTarget.value)}
            minLength={3}
            maxLength={30}
          />
          <TextInput
            required
            label={t("name")}
            placeholder={t("placeholders.name")}
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            maxLength={120}
          />
          <TextInput
            type="email"
            label={t("email")}
            placeholder={t("placeholders.email")}
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            maxLength={320}
          />
          <TextInput
            label={t("phone")}
            placeholder={t("placeholders.phone")}
            value={phone}
            onChange={(event) => setPhone(event.currentTarget.value)}
            maxLength={30}
          />
          {!user ? (
            <PasswordInput
              required
              label={t("password")}
              description={t("passwordHint")}
              placeholder={t("placeholders.password")}
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              minLength={8}
              maxLength={72}
            />
          ) : null}
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose} disabled={submitting}>
              {t("cancel")}
            </Button>
            <Button
              color={accentColor}
              autoContrast
              type="submit"
              loading={submitting}
            >
              {user ? t("save") : t("create")}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
