"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, Group, Stack, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  getSessionUser,
  type SessionUser,
} from "@/features/auth/data/session";

const workspaces = [
  { key: "customer", href: "/" },
  { key: "owner", href: "/owner" },
  { key: "admin", href: "/admin" },
  { key: "systemAdmin", href: "/system-admin" },
] as const;

type WorkspaceKey = (typeof workspaces)[number]["key"];

export function getAccessibleWorkspaces(
  role: SessionUser["role"] | undefined,
): WorkspaceKey[] {
  if (role === "ADMIN") return ["customer", "systemAdmin"];
  if (role === "OWNER" || role === "STAFF") {
    return ["customer", "owner", "admin"];
  }
  return ["customer"];
}

export function getWorkspace(pathname: string) {
  if (pathname.startsWith("/system-admin")) return "systemAdmin";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/owner")) return "owner";
  return "customer";
}

export function WorkspaceSwitcher() {
  const pathname = usePathname();
  const t = useTranslations("Navigation.workspaceSwitcher");
  const current = getWorkspace(pathname);
  const session = useQuery({
    queryKey: ["auth-session"],
    queryFn: ({ signal }) => getSessionUser(signal),
    retry: false,
    staleTime: 5 * 60_000,
  });
  const accessible = getAccessibleWorkspaces(session.data?.role);
  const visibleWorkspaces = workspaces.filter(({ key }) =>
    accessible.includes(key),
  );

  return (
    <Stack gap="sm">
      <Text fw={800}>{t("title")}</Text>
      <Group grow gap="xs">
        {visibleWorkspaces.map(({ key, href }) => (
          <Button
            key={key}
            component={Link}
            href={href}
            variant={current === key ? "filled" : "default"}
            color="warmCoral"
            radius="sm"
            size="compact-sm"
          >
            {t(key)}
          </Button>
        ))}
      </Group>
    </Stack>
  );
}
