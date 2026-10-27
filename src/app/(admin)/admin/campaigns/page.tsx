import { AdminCampaignsScreen } from "@/features/admin";
import { requireRestaurantOwner } from "@/features/auth/data/server-session";

export default async function AdminCampaignsPage() {
  await requireRestaurantOwner();
  return <AdminCampaignsScreen />;
}
