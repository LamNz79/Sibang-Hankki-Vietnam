import { OwnerSettingsScreen } from "@/features/owner/settings";
import { requireRestaurantOwner } from "@/features/auth/data/server-session";

export default async function OwnerSettingsPage() {
  await requireRestaurantOwner();
  return <OwnerSettingsScreen />;
}
