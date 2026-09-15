import {
  ActionIcon,
  Alert,
  Button,
  Group,
  NumberInput,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { LARGE_PARTY_THRESHOLD } from "@/features/reservations/types";

const guestOptions = [2, 4, 6] as const;

type BookingGuestSelectorProps = {
  value: number;
  onChange: (guests: number) => void;
};

/** Editable party size with quick presets for common reservation sizes. */
export function BookingGuestSelector({
  value,
  onChange,
}: BookingGuestSelectorProps) {
  return (
    <Stack gap="sm">
      <Text fw={700} size="lg">
        Guests
      </Text>
      <Group justify="center" gap="sm" wrap="nowrap">
        <ActionIcon
          variant="light"
          color="warmCoral"
          size="lg"
          radius="md"
          aria-label="Remove one guest"
          disabled={value <= 1}
          onClick={() => onChange(value - 1)}
        >
          <IconMinus size={18} />
        </ActionIcon>
        <NumberInput
          value={value}
          min={1}
          allowDecimal={false}
          allowNegative={false}
          hideControls
          inputMode="numeric"
          aria-label="Number of guests"
          onChange={(nextValue) => {
            if (typeof nextValue === "number") {
              onChange(Math.max(1, Math.trunc(nextValue)));
            }
          }}
          styles={{ input: { textAlign: "center", fontWeight: 700 } }}
          w={96}
        />
        <ActionIcon
          variant="light"
          color="warmCoral"
          size="lg"
          radius="md"
          aria-label="Add one guest"
          onClick={() => onChange(value + 1)}
        >
          <IconPlus size={18} />
        </ActionIcon>
      </Group>
      <SimpleGrid cols={3} spacing="sm">
        {guestOptions.map((count) => {
          const active = value === count;

          return (
            <Button
              key={count}
              variant={active ? "light" : "default"}
              color="warmCoral"
              radius="md"
              onClick={() => onChange(count)}
            >
              {count}
            </Button>
          );
        })}
      </SimpleGrid>
      {value > LARGE_PARTY_THRESHOLD ? (
        <Alert color="yellow" radius="md" title="Large party request">
          <Stack gap="sm">
            <Text size="sm">
              For groups larger than 10 guests, contact the restaurant directly
              to confirm a suitable time. Online booking is unavailable.
            </Text>
          </Stack>
        </Alert>
      ) : null}
    </Stack>
  );
}
