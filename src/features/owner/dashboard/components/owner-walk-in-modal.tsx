import {
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { uiColors } from "@/theme";

type OwnerWalkInModalProps = {
  opened: boolean;
  onClose: () => void;
};

/** Prototype form for adding a guest who arrives without a reservation. */
export function OwnerWalkInModal({
  opened,
  onClose,
}: OwnerWalkInModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={800}>Add walk-in</Text>}
      centered
      radius="lg"
    >
      <Stack gap="md">
        <Text size="sm" c={uiColors.textSecondary}>
          UI placeholder for guests who arrive without an online reservation.
        </Text>
        <TextInput label="Guest name" placeholder="Enter guest name" />
        <TextInput label="Phone" placeholder="Optional phone number" />
        <NumberInput
          label="Party size"
          min={1}
          max={20}
          defaultValue={2}
        />
        <Textarea label="Notes" placeholder="Seating or allergy notes" />
        <Group grow>
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>Add guest</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
