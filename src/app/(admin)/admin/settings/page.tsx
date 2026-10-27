import { AdminSettingsScreen } from "@/features/admin";
import { requireRestaurantOwner } from "@/features/auth/data/server-session";

export default async function AdminSettingsPage() {
  await requireRestaurantOwner();
  return <AdminSettingsScreen />;
}
