import {
  Box,
  Group,
  rem,
  Stack,
  Title,
} from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { uiColors } from "@/theme";

type MobileShellProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  children: ReactNode;
  bottomNav?: ReactNode;
  footerContent?: ReactNode;
  headerContent?: ReactNode;
};

export function MobileShell({
  title,
  subtitle,
  backHref,
  children,
  bottomNav,
  footerContent,
  headerContent,
}: MobileShellProps) {
  return (
    <Box
      mih="100dvh"
      bg={uiColors.appBackground}
      p={0}
    >
      <Box
        mx="auto"
        w="100%"
        maw={560}
        h="100dvh"
        miw={0}
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: uiColors.surface,
        }}
      >
        <Box
          px={16}
          pt={`max(${rem(8)}, env(safe-area-inset-top))`}
          pb={8}
          style={{
            flexShrink: 0,
            position: "sticky",
            top: 0,
            zIndex: 20,
            background: uiColors.surfaceOverlay,
            borderBottom: `1px solid ${uiColors.border}`,
          }}
        >
          {headerContent ? (
            headerContent
          ) : (
            <Group
              h={44}
              gap="sm"
              wrap="nowrap"
              aria-label={subtitle ? `${title}: ${subtitle}` : title}
            >
              <Box w={40} miw={40}>
                {backHref ? (
                  <a
                    href={backHref}
                    aria-label="Go back"
                    style={{
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 999,
                      color: uiColors.textPrimary,
                      background: uiColors.surfaceMuted,
                      textDecoration: "none",
                    }}
                  >
                    <IconChevronLeft size={22} />
                  </a>
                ) : null}
              </Box>

              <Title
                order={2}
                size="md"
                ta="center"
                lineClamp={1}
                c={uiColors.textPrimary}
                style={{ flex: 1 }}
              >
                {title}
              </Title>

              <Box w={40} miw={40} />
            </Group>
          )}
        </Box>

        <Box
          px={16}
          pt={4}
          pb={12}
          className="hide-scrollbar"
          style={{
            minHeight: 0,
            flex: 1,
            overflowY: "auto",
          }}
        >
          <Stack gap={18}>{children}</Stack>
        </Box>

        {footerContent || bottomNav ? (
          <Box
            px={16}
            pt={8}
            pb={`max(${rem(12)}, env(safe-area-inset-bottom))`}
            style={{
              flexShrink: 0,
              position: "sticky",
              bottom: 0,
              zIndex: 20,
              backdropFilter: "blur(14px)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.82) 26%, rgba(255,255,255,0.96) 100%)",
            }}
          >
            {footerContent ?? bottomNav}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
