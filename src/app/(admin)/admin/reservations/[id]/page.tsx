import { notFound } from "next/navigation";
import { AdminReservationDetailScreen } from "@/features/admin";
import { getAdminReservationById } from "@/features/admin/data/admin-reservations";

export default async function AdminReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const reservation = getAdminReservationById((await params).id);

  if (!reservation) notFound();

  return <AdminReservationDetailScreen reservation={reservation} />;
}
