import { AdminReservationDetailScreen } from "@/features/admin";

export default async function AdminReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <AdminReservationDetailScreen id={(await params).id} />;
}
