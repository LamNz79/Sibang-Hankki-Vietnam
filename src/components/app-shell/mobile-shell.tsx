import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Group,
  rem,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconBell, IconChevronLeft } from "@tabler/icons-react";
import { ReactNode } from "react";

type MobileShellProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  children: ReactNode;
  bottomNav?: ReactNode;
  headerContent?: ReactNode;
};

export function MobileShell({
  title,
  subtitle,
  showBack = false,
  children,
  bottomNav,
  headerContent,
}: MobileShellProps) {
  return (
    <Box
      mih="100vh"
      bg="linear-gradient(180deg, #fffaf4 0%, #f7f1e7 44%, #efe5d7 100%)"
      p={0}
    >
      <Box
        mx="auto"
        w="100%"
        maw={560}
        h={"100vh"}
        miw={0}
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(255,250,244,0.98) 0%, rgba(252,246,238,0.98) 100%)",
        }}
      >
        <Box
          px={16}
          pt={`max(${rem(12)}, env(safe-area-inset-top))`}
          pb={12}
          style={{
            flexShrink: 0,
            position: "sticky",
            top: 0,
            zIndex: 20,
            backdropFilter: "blur(14px)",
            background:
              "linear-gradient(180deg, rgba(255,250,244,0.96) 0%, rgba(255,250,244,0.82) 72%, rgba(255,250,244,0) 100%)",
          }}
        >
          {headerContent ? (
            headerContent
          ) : (
            <Card
              radius="xl"
              p="md"
              shadow="sm"
              style={{
                border: "1px solid rgba(207, 183, 145, 0.24)",
                background: "rgba(255,251,247,0.88)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 12px 30px rgba(100, 71, 34, 0.08)",
              }}
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Group align="flex-start" wrap="nowrap">
                  {showBack ? (
                    <ActionIcon
                      component="a"
                      href="/"
                      variant="subtle"
                      color="gray"
                      radius="xl"
                      size="lg"
                    >
                      <IconChevronLeft size={18} />
                    </ActionIcon>
                  ) : null}

                  <Stack gap={2}>
                    <Badge color="oligoOrange" variant="light" w="fit-content" size="sm">
                      Sibang customer
                    </Badge>
                    <Title order={3} size="h4" c="#17352f">
                      {title}
                    </Title>
                    {subtitle ? (
                      <Text c="#6f7b74" size="sm">
                        {subtitle}
                      </Text>
                    ) : null}
                  </Stack>
                </Group>

                <ActionIcon variant="light" color="oligoTeal" radius="xl" size="lg">
                  <IconBell size={18} />
                </ActionIcon>
              </Group>
            </Card>
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

        {bottomNav ? (
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
                "linear-gradient(180deg, rgba(255,250,244,0) 0%, rgba(255,250,244,0.82) 26%, rgba(255,250,244,0.96) 100%)",
            }}
          >
            {bottomNav}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
