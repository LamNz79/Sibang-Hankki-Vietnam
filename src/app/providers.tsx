"use client";

import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

const theme = createTheme({
  primaryColor: "oligoTeal",
  primaryShade: 9,
  defaultRadius: "lg",
  fontFamily: "var(--font-geist-sans), sans-serif",
  headings: {
    fontFamily: "var(--font-geist-sans), sans-serif",
  },
  colors: {
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
    ],
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
    ],
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
    ],
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
    ],
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  );
}
