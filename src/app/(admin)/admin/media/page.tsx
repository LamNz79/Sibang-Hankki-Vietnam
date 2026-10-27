import { AdminMediaScreen } from "@/features/admin";
import { requireRestaurantOwner } from "@/features/auth/data/server-session";

export default async function AdminMediaPage() {
  await requireRestaurantOwner();
  return <AdminMediaScreen />;
}
