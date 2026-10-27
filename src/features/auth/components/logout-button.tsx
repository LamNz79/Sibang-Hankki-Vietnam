"use client";

import { ActionIcon, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconLogout } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { logout } from "@/features/auth/data/session";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("Account");
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries();
      router.replace("/login");
      router.refresh();
    },
    onError: () => notifications.show({ color: "red", message: t("logoutError") }),
  });

  const logOut = () => mutation.mutate();

  if (compact) {
    return (
      <ActionIcon
        variant="light"
        color="red"
        radius="xl"
        size={40}
        aria-label={t("logout")}
        loading={mutation.isPending}
        onClick={logOut}
      >
        <IconLogout size={19} />
      </ActionIcon>
    );
  }

  return (
    <Button
      fullWidth
      variant="light"
      color="red"
      leftSection={<IconLogout size={18} />}
      loading={mutation.isPending}
      onClick={logOut}
    >
      {t("logout")}
    </Button>
  );
}
