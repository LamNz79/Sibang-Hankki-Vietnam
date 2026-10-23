import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { restaurantTimeZone } from "@/lib/date-time";
import { defaultLocale, isAppLocale, localeCookie } from "./config";

export default getRequestConfig(async () => {
  const storedLocale = (await cookies()).get(localeCookie)?.value;
  const locale = isAppLocale(storedLocale) ? storedLocale : defaultLocale;

  return {
    locale,
    timeZone: restaurantTimeZone,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
