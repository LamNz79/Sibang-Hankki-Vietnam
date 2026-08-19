"use server";

import { cookies } from "next/headers";
import { isAppLocale, localeCookie } from "./config";

export async function setLocale(locale: string) {
  if (!isAppLocale(locale)) {
    throw new Error("Unsupported locale");
  }

  (await cookies()).set(localeCookie, locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
}
