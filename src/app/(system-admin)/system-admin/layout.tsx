import type { ReactNode } from "react";
import { requireSystemAdmin } from "@/features/auth/data/server-session";
import { SystemAdminShell } from "@/features/system-admin";

export default async function SystemAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSystemAdmin();
  return <SystemAdminShell>{children}</SystemAdminShell>;
}
