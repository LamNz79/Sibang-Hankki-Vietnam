import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SessionUser } from "@/features/auth/data/session";
import { apiEndpoints } from "@/lib/api/endpoints";

export function canAccessRestaurantWorkspace(role: SessionUser["role"]) {
  return role === "OWNER" || role === "STAFF";
}

export function canAccessSystemAdmin(role: SessionUser["role"]) {
  return role === "ADMIN";
}

export function canManageRestaurant(role: SessionUser["role"]) {
  return role === "OWNER";
}

async function getSessionUser() {
  const cookieHeader = (await cookies()).toString();
  const response = await fetch(
    `${process.env.API_BASE_URL ?? "http://localhost:8080"}${apiEndpoints.authMe}`,
    { cache: "no-store", headers: { cookie: cookieHeader } },
  ).catch(() => null);

  if (!response?.ok) return null;

  return (await response.json().catch(() => null)) as SessionUser | null;
}

export async function requireRestaurantWorkspace() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (!canAccessRestaurantWorkspace(user.role)) redirect("/");
}

export async function requireRestaurantOwner() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (!canManageRestaurant(user.role)) redirect("/admin");
}

export async function requireSystemAdmin() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (!canAccessSystemAdmin(user.role)) redirect("/");
}
