"use client";

import type { MantineColorsTuple } from "@mantine/core";
import { createContext, useContext } from "react";
import {
  defaultAccountPreferences,
  type AccountPreferences,
} from "@/features/system-admin/data/account-preferences";
import { restaurantTimeZone } from "@/lib/date-time";

const AccountPreferencesContext = createContext(defaultAccountPreferences);

export const AccountPreferencesProvider = AccountPreferencesContext.Provider;

export function useAccountPreferences(): AccountPreferences {
  return useContext(AccountPreferencesContext);
}

export function formatPreferenceDate(
  value: Date,
  preferences: Pick<AccountPreferences, "dateFormat" | "locale">,
) {
  return new Intl.DateTimeFormat(
    preferences.dateFormat === "DD_MM_YYYY" ? "en-GB" : "en-US",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: restaurantTimeZone,
    },
  ).format(value);
}

function mix(hex: string, target: number, amount: number) {
  const channels = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));
  return `#${channels.map((channel) => Math.round(channel + (target - channel) * amount)
    .toString(16).padStart(2, "0")).join("")}`;
}

export function accountAccentColor(value: string) {
  const color = /^#[0-9A-Fa-f]{6}$/.test(value)
    ? value.toUpperCase()
    : defaultAccountPreferences.themeColor;
  const channels = [1, 3, 5].map((start) => {
    const channel = Number.parseInt(color.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  return 1.05 / (luminance + 0.05) >= 4.5 ? color : mix(color, 0, 0.55);
}

export function accountAccentPalette(value: string): MantineColorsTuple {
  const color = accountAccentColor(value);
  return [
    mix(color, 255, 0.94),
    mix(color, 255, 0.84),
    mix(color, 255, 0.7),
    mix(color, 255, 0.52),
    mix(color, 255, 0.34),
    mix(color, 255, 0.18),
    color,
    color,
    mix(color, 0, 0.14),
    mix(color, 0, 0.28),
  ];
}
