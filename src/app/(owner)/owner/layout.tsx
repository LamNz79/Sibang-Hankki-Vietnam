import type { ReactNode } from "react";
import { requireRestaurantWorkspace } from "@/features/auth/data/server-session";

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  await requireRestaurantWorkspace();
  return children;
}
