import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isAppLocale, localeCookie } from "./config";

export default getRequestConfig(async () => {
  const storedLocale = (await cookies()).get(localeCookie)?.value;
  const locale = isAppLocale(storedLocale) ? storedLocale : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
