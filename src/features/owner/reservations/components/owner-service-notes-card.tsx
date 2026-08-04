import { Card, Group, Stack, Text } from "@mantine/core";
import { IconMessage } from "@tabler/icons-react";
import { uiColors } from "@/theme";

export function OwnerServiceNotesCard({ note }: { note?: string }) {
  return (
    <Card
      radius="lg"
      p="md"
      style={{
        background: uiColors.statusWarningSurface,
        border: `1px solid ${uiColors.statusWarningBorder}`,
      }}
    >
      <Group gap="sm" align="flex-start" wrap="nowrap">
        <IconMessage
          size={18}
          color={uiColors.statusWarningText}
          style={{ marginTop: 2, flexShrink: 0 }}
        />
        <Stack gap={4}>
          <Text fw={750} size="sm" c={uiColors.statusWarningTextStrong}>
            Service notes
          </Text>
          <Text size="sm" c={uiColors.statusWarningTextStrong}>
            {note || "No service notes"}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}
