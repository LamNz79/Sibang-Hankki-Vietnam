import { AdminStoresScreen } from "@/features/admin";
import { requireRestaurantOwner } from "@/features/auth/data/server-session";

export default async function AdminStoresPage() {
  await requireRestaurantOwner();
  return <AdminStoresScreen />;
}
