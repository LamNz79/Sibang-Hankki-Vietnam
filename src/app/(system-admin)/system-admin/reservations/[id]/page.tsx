import { SystemAdminReservationDetailScreen } from "@/features/system-admin";

export default async function SystemAdminReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <SystemAdminReservationDetailScreen id={(await params).id} />;
}
