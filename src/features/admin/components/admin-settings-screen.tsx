"use client";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { OwnerSettingsScreen } from "@/features/owner/settings/components/owner-settings-screen";

export function AdminSettingsScreen() {
  return (
    <AdminShell>
      <OwnerSettingsScreen embedded />
    </AdminShell>
  );
}
