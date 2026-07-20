import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Group,
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
};

export function MobileShell({
  title,
  subtitle,
  showBack = false,
  children,
  bottomNav,
}: MobileShellProps) {
  return (
    <Box
      mih="100vh"
      bg="linear-gradient(180deg, #fffaf4 0%, #f7efe3 48%, #efe7db 100%)"
      p={0}
    >
      <Box
        mx="auto"
        w="100%"
        maw={500}
        h={"100vh"}
        miw={0}
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "#fffaf4",
        }}
      >
        <Box px={16} pt={16} style={{ flexShrink: 0 }}>
          <Card
            radius="xl"
            p="md"
            shadow="sm"
            style={{
              border: "1px solid rgba(202, 181, 150, 0.26)",
              background: "rgba(255,248,241,0.92)",
              backdropFilter: "blur(12px)",
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
                  <Badge color="sand" variant="light" w="fit-content">
                    Mobile first
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

              <ActionIcon variant="light" color="teal" radius="xl" size="lg">
                <IconBell size={18} />
              </ActionIcon>
            </Group>
          </Card>
        </Box>

        <Box
          px={16}
          pt={16}
          pb={24}
          className="hide-scrollbar"
          style={{
            minHeight: 0,
            flex: 1,
            overflowY: "auto",
          }}
        >
          <Stack gap="md">{children}</Stack>
        </Box>

        {bottomNav ? (
          <Box px={16} pt={8} pb={16} style={{ flexShrink: 0 }}>
            {bottomNav}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
