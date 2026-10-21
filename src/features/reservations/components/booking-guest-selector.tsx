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
import { useTranslations } from "next-intl";

const guestOptions = [2, 4, 6] as const;

type BookingGuestSelectorProps = {
  value: number;
  minimum: number;
  maximum: number;
  largePartyThreshold: number;
  onChange: (guests: number) => void;
};

/** Editable party size with quick presets for common reservation sizes. */
export function BookingGuestSelector({
  value,
  minimum,
  maximum,
  largePartyThreshold,
  onChange,
}: BookingGuestSelectorProps) {
  const t = useTranslations("CustomerBooking.guests");
  const visibleGuestOptions = guestOptions.filter(
    (count) => count >= minimum && count <= maximum,
  );

  return (
    <Stack gap="sm">
      <Text fw={700} size="lg">
        {t("title")}
      </Text>
      <Group justify="center" gap="sm" wrap="nowrap">
        <ActionIcon
          variant="light"
          color="warmCoral"
          size="lg"
          radius="md"
          aria-label={t("remove")}
          disabled={value <= minimum}
          onClick={() => onChange(value - 1)}
        >
          <IconMinus size={18} />
        </ActionIcon>
        <NumberInput
          value={value}
          min={minimum}
          max={maximum}
          allowDecimal={false}
          allowNegative={false}
          hideControls
          inputMode="numeric"
          aria-label={t("count")}
          onChange={(nextValue) => {
            if (typeof nextValue === "number") {
              onChange(
                Math.min(maximum, Math.max(minimum, Math.trunc(nextValue))),
              );
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
          aria-label={t("add")}
          disabled={value >= maximum}
          onClick={() => onChange(value + 1)}
        >
          <IconPlus size={18} />
        </ActionIcon>
      </Group>
      {visibleGuestOptions.length > 0 ? (
        <SimpleGrid cols={3} spacing="sm">
        {visibleGuestOptions.map((count) => {
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
      ) : null}
      {value >= largePartyThreshold ? (
        <Alert color="yellow" radius="md" title={t("largePartyTitle")}>
          <Stack gap="sm">
            <Text size="sm">
              {t("largePartyDescription")}
            </Text>
          </Stack>
        </Alert>
      ) : null}
    </Stack>
  );
}
