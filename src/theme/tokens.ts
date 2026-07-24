import type { MantineColorsTuple } from "@mantine/core";

export const brandPalettes = {
  oligoTeal: [
    "#e8f7f8",
    "#d1eeef",
    "#a6dbdf",
    "#78c8cf",
    "#53b8c2",
    "#39adba",
    "#2ca8b6",
    "#1a92a1",
    "#0a8292",
    "#007487",
  ] as MantineColorsTuple,
  oligoOrange: [
    "#fbf1eb",
    "#f3dfd3",
    "#e7bda7",
    "#da9a79",
    "#cf7d53",
    "#c56d3f",
    "#bf6e3c",
    "#aa5d2f",
    "#964f26",
    "#81411b",
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
  appBackground: "#f3f5f4",
  surface: "#ffffff",
  surfaceAlt: "#fbfcfc",
  surfaceMuted: "#f4f7f6",
  surfaceOverlay: "rgba(255, 255, 255, 0.98)",

  border: "#d5dfdc",
  borderStrong: "#cfd9d5",

  textPrimary: "#20312c",
  textSecondary: "#6f7d78",
  textMuted: "#8a8f89",

  brandPrimary: "#007487",
  brandPrimaryStrong: "#005f70",
  brandPrimarySoft: "#f2f8f8",
  brandPrimaryMuted: "#5b7b72",
  brandPrimaryShadow: "rgba(0, 116, 135, 0.14)",
  brandOrange: "#bf6e3c",
  brandOrangeSoft: "#fbefe8",

  statusSuccessSurface: "#eaf6f2",
  statusSuccessText: "#08725f",
  statusWarningSurface: "#fff2dd",
  statusWarningText: "#9a5a00",
  statusWarningBorder: "#ead1a8",
  statusWarningTextStrong: "#6f4810",
  statusInfoSurface: "#eef4ff",
  statusInfoText: "#406397",

  shadowSoft: "rgba(85, 101, 98, 0.08)",
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
