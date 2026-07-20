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
    <Box className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fff8_0%,#edf5f1_38%,#dce8e3_100%)] px-0 py-0 md:px-6 md:py-8">
      <Box className="mx-auto flex h-screen w-full max-w-[420px] flex-col overflow-hidden bg-[#f7faf8] md:h-[880px] md:rounded-[34px] md:border md:border-white/60 md:shadow-[0_24px_80px_rgba(21,35,30,0.16)]">
        <Box className="shrink-0 px-4 pt-4">
          <Card radius="xl" p="md" shadow="sm" className="border border-white/70 bg-white/90 backdrop-blur">
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
                  <Badge color="teal" variant="light" w="fit-content">
                    Mobile first
                  </Badge>
                  <Title order={3} size="h4">
                    {title}
                  </Title>
                  {subtitle ? (
                    <Text c="dimmed" size="sm">
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

        <Box className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-6">
          <Stack gap="md">{children}</Stack>
        </Box>

        {bottomNav ? (
          <Box className="shrink-0 px-4 pb-4 pt-2">
            {bottomNav}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
