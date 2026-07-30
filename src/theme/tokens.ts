import type { MantineColorsTuple } from "@mantine/core";

export const brandPalettes = {
  warmCoral: [
    "#fff6f2",
    "#fce9e2",
    "#f8d1c5",
    "#f2ad99",
    "#e9866d",
    "#d9664d",
    "#c84f36",
    "#b84a2f",
    "#a63d2f",
    "#8f2d23",
  ] as MantineColorsTuple,
  teal: [
    "#eef8f5",
    "#d8eee8",
    "#b1ddd2",
    "#87cbb9",
    "#64bcaa",
    "#4db39e",
    "#3cae98",
    "#2b987f",
    "#1d886f",
    "#0a755d",
  ] as MantineColorsTuple,
  sand: [
    "#fffaf2",
    "#fdf1de",
    "#f8dfb5",
    "#f3cc88",
    "#eeba63",
    "#ebb04a",
    "#e9aa3d",
    "#cf9430",
    "#b88025",
    "#9f6c17",
  ] as MantineColorsTuple,
} as const;

export const uiColors = {
  appBackground: "#f3f1f0",
  surface: "#ffffff",
  surfaceAlt: "#fff7f3",
  surfaceMuted: "#f8f2ef",
  surfaceOverlay: "rgba(255, 255, 255, 0.98)",

  border: "#e7d6d0",
  borderStrong: "#d8c2ba",

  textPrimary: "#2a1714",
  textSecondary: "#6f5a54",
  textMuted: "#8b7770",

  brandPrimary: "#b84a2f",
  brandPrimaryStrong: "#a63d2f",
  brandPrimarySoft: "#fce9e2",
  brandPrimarySubtle: "#fff6f2",
  brandPrimaryMuted: "#8f5f51",
  brandPrimaryShadow: "rgba(184, 74, 47, 0.18)",

  accentVipSurface: "#f9e9ef",
  accentVipText: "#a33b5c",
  rating: "#a66a00",

  statusSuccessSurface: "#e8f4ef",
  statusSuccessText: "#217a5b",
  statusWarningSurface: "#fff4db",
  statusWarningText: "#9a6700",
  statusWarningBorder: "#ead1a8",
  statusWarningTextStrong: "#6f4810",
  statusInfoSurface: "#edf4f7",
  statusInfoText: "#355e77",
  statusErrorSurface: "#feeceb",
  statusErrorText: "#b42318",

  shadowSoft: "rgba(80, 47, 38, 0.08)",
} as const;

export const uiRadii = {
  control: 12,
  card: 16,
  sheet: 24,
  pill: 999,
} as const;

export const uiShadows = {
  soft: `0 8px 24px ${uiColors.shadowSoft}`,
  floating: `0 12px 32px ${uiColors.brandPrimaryShadow}`,
} as const;

export const uiTypography = {
  fontFamily: "var(--font-geist-sans), sans-serif",
} as const;
