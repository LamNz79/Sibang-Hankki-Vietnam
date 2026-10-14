"use client";

import { Button, Group, Modal, Stack, Text } from "@mantine/core";

type StatusActionDialogProps = {
  opened: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  danger?: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function StatusActionDialog({
  opened,
  title,
  description,
  cancelLabel,
  confirmLabel,
  danger = false,
  loading,
  onClose,
  onConfirm,
}: StatusActionDialogProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Stack>
        <Text size="sm">{description}</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            color={danger ? "red" : "warmCoral"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
