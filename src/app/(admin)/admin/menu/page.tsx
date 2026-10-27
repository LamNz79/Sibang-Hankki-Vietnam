import { AdminMenuScreen } from "@/features/admin";
import { requireRestaurantOwner } from "@/features/auth/data/server-session";

export default async function AdminMenuPage() {
  await requireRestaurantOwner();
  return <AdminMenuScreen />;
}
