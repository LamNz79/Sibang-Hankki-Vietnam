"use client";

import type { MantineColorsTuple } from "@mantine/core";
import { createContext, useContext } from "react";
import {
  defaultAccountPreferences,
  type AccountPreferences,
} from "@/features/system-admin/data/account-preferences";

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
    { day: "2-digit", month: "2-digit", year: "numeric" },
  ).format(value);
}

function mix(hex: string, target: number, amount: number) {
  const channels = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));
  return `#${channels.map((channel) => Math.round(channel + (target - channel) * amount)
    .toString(16).padStart(2, "0")).join("")}`;
}

export function accountAccentPalette(value: string): MantineColorsTuple {
  const color = /^#[0-9A-Fa-f]{6}$/.test(value)
    ? value.toUpperCase()
    : defaultAccountPreferences.themeColor;
  return [
    mix(color, 255, 0.94),
    mix(color, 255, 0.84),
    mix(color, 255, 0.7),
    mix(color, 255, 0.52),
    mix(color, 255, 0.34),
    mix(color, 255, 0.18),
    mix(color, 255, 0.08),
    color,
    mix(color, 0, 0.14),
    mix(color, 0, 0.28),
  ];
}
