"use client";

import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconLogout } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { logout } from "@/features/auth/data/session";

export function LogoutButton() {
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

  return (
    <Button
      fullWidth
      variant="light"
      color="red"
      leftSection={<IconLogout size={18} />}
      loading={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {t("logout")}
    </Button>
  );
}
