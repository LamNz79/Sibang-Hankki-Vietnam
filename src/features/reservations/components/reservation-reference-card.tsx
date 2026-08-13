"use client";

import { useState } from "react";
import { ActionIcon, Card, Group, Stack, Text } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { uiColors } from "@/theme";

type ReservationReferenceCardProps = {
  reference: string;
};

/** Displays a booking reference and owns its clipboard feedback interaction. */
export function ReservationReferenceCard({
  reference,
}: ReservationReferenceCardProps) {
  const [copied, setCopied] = useState(false);

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Card
      radius="lg"
      p="md"
      style={{
        border: `1px dashed ${uiColors.borderStrong}`,
        background: uiColors.surface,
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={2}>
          <Text size="xs" c={uiColors.textSecondary}>
            Booking reference
          </Text>
          <Text fw={800} c={uiColors.textPrimary}>
            {reference}
          </Text>
        </Stack>
        <ActionIcon
          variant="light"
          color={copied ? "teal" : "warmCoral"}
          radius="md"
          size="lg"
          aria-label="Copy booking reference"
          onClick={copyReference}
        >
          {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
        </ActionIcon>
      </Group>
    </Card>
  );
}
