import { Card, SimpleGrid, Stack, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { uiColors } from "@/theme";

type BookingTimeSelectorProps = {
  times: string[];
  value: string | null;
  onChange: (time: string) => void;
};

/** Available-time grid with an empty state for dates without open slots. */
export function BookingTimeSelector({
  times,
  value,
  onChange,
}: BookingTimeSelectorProps) {
  const t = useTranslations("BookingTime");
  return (
    <Stack gap="sm">
      <Text fw={700} size="lg">
        {t("title")}
      </Text>
      {times.length > 0 ? (
        <SimpleGrid cols={3} spacing="sm">
          {times.map((time) => {
            const active = value === time;

            return (
              <Card
                key={time}
                p="md"
                radius="md"
                onClick={() => onChange(time)}
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
                  {time}
                </Text>
              </Card>
            );
          })}
        </SimpleGrid>
      ) : (
        <Card
          radius="lg"
          p="md"
          style={{
            border: `1px solid ${uiColors.border}`,
            background: uiColors.surfaceAlt,
          }}
        >
          <Stack gap={4}>
            <Text fw={700} c={uiColors.textPrimary}>
              {t("emptyTitle")}
            </Text>
            <Text size="sm" c={uiColors.textSecondary}>
              {t("emptyDescription")}
            </Text>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
