import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SessionUser } from "@/features/auth/data/session";
import { apiEndpoints } from "@/lib/api/endpoints";

export function canAccessRestaurantWorkspace(role: SessionUser["role"]) {
  return role === "OWNER" || role === "STAFF";
}

export async function requireRestaurantWorkspace() {
  const cookieHeader = (await cookies()).toString();
  const response = await fetch(
    `${process.env.API_BASE_URL ?? "http://localhost:8080"}${apiEndpoints.authMe}`,
    { cache: "no-store", headers: { cookie: cookieHeader } },
  ).catch(() => null);

  if (!response?.ok) redirect("/login");

  const user = (await response.json().catch(() => null)) as SessionUser | null;
  if (!user || !canAccessRestaurantWorkspace(user.role)) redirect("/");
}
