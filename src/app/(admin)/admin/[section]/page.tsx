import { notFound } from "next/navigation";
import {
  AdminSectionPlaceholder,
  type AdminSection,
} from "@/features/admin";

const adminSections: AdminSection[] = [
  "settings",
];

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (!adminSections.includes(section as AdminSection)) notFound();

  return <AdminSectionPlaceholder section={section as AdminSection} />;
}
