"use client";

import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

const theme = createTheme({
  primaryColor: "teal",
  defaultRadius: "lg",
  fontFamily: "var(--font-geist-sans), sans-serif",
  headings: {
    fontFamily: "var(--font-geist-sans), sans-serif",
  },
  colors: {
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
