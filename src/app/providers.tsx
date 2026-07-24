"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { appTheme } from "@/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={appTheme}>
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  );
}
