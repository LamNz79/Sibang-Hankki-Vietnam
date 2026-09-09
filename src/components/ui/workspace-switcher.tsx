"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, Group, Stack, Text } from "@mantine/core";

const workspaces = [
  { key: "customer", href: "/" },
  { key: "owner", href: "/owner" },
  { key: "admin", href: "/admin" },
] as const;

export function getWorkspace(pathname: string) {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/owner")) return "owner";
  return "customer";
}

export function WorkspaceSwitcher() {
  const pathname = usePathname();
  const t = useTranslations("Navigation.workspaceSwitcher");
  const current = getWorkspace(pathname);

  return (
    <Stack gap="sm">
      <Text fw={800}>{t("title")}</Text>
      <Group grow gap="xs">
        {workspaces.map(({ key, href }) => (
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
