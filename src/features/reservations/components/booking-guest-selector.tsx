import { Card, SimpleGrid, Stack, Text } from "@mantine/core";
import { uiColors } from "@/theme";

const guestOptions = [2, 4, 6] as const;

type BookingGuestSelectorProps = {
  value: number;
  onChange: (guests: number) => void;
};

/** Party-size options supported by the current restaurant booking prototype. */
export function BookingGuestSelector({
  value,
  onChange,
}: BookingGuestSelectorProps) {
  return (
    <Stack gap="sm">
      <Text fw={700} size="lg">
        Guests
      </Text>
      <SimpleGrid cols={3} spacing="sm">
        {guestOptions.map((count) => {
          const active = value === count;

          return (
            <Card
              key={count}
              p="md"
              radius="md"
              onClick={() => onChange(count)}
              style={{
                cursor: "pointer",
                border: active
                  ? `1px solid ${uiColors.brandPrimary}`
                  : `1px solid ${uiColors.border}`,
                background: active
                  ? uiColors.brandPrimarySoft
                  : uiColors.surface,
              }}
            >
              <Text
                ta="center"
                fw={active ? 700 : 500}
                c={active ? uiColors.brandPrimary : uiColors.textPrimary}
              >
                {count}
              </Text>
            </Card>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
