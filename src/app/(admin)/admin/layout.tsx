import type { ReactNode } from "react";
import { requireRestaurantWorkspace } from "@/features/auth/data/server-session";

export default async function RestaurantAdminLayout({ children }: { children: ReactNode }) {
  await requireRestaurantWorkspace();
  return children;
}
