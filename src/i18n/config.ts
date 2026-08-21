export const locales = ["vi", "en", "ko"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "vi";
export const localeCookie = "sibang-locale";

export function isAppLocale(value: string | undefined): value is AppLocale {
  return locales.some((locale) => locale === value);
}
