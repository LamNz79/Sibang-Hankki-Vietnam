import { OwnerMarketingScreen } from "@/features/owner/marketing";
import { requireRestaurantOwner } from "@/features/auth/data/server-session";

export default async function OwnerMarketingPage() {
  await requireRestaurantOwner();
  return <OwnerMarketingScreen />;
}
