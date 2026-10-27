import { AdminRevenueScreen } from "@/features/admin";
import { requireRestaurantOwner } from "@/features/auth/data/server-session";

export default async function AdminRevenuePage() {
  await requireRestaurantOwner();
  return <AdminRevenueScreen />;
}
