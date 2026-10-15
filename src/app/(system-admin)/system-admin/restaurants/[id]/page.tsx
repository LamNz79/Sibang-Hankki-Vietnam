import { SystemAdminRestaurantDetailScreen } from "@/features/system-admin";

export default async function SystemAdminRestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <SystemAdminRestaurantDetailScreen id={(await params).id} />;
}
