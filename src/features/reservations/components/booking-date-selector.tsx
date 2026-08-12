import dayjs from "dayjs";
import { Card, Stack, Text } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { uiColors } from "@/theme";

type BookingDateSelectorProps = {
  value: string | null;
  label: string;
  minDate: string;
  maxDate: string;
  onChange: (date: string | null) => void;
};

/** Calendar control for selecting a date inside the active booking window. */
export function BookingDateSelector({
  value,
  label,
  minDate,
  maxDate,
  onChange,
}: BookingDateSelectorProps) {
  return (
    <Stack gap="sm">
      <Text fw={700} size="lg">
        Date
      </Text>
      <Card
        radius="lg"
        p="sm"
        style={{
          border: `1px solid ${uiColors.border}`,
          background: uiColors.surface,
        }}
      >
        <Stack gap="sm">
          <DatePicker
            fullWidth
            value={value}
            onChange={onChange}
            minDate={minDate}
            maxDate={maxDate}
            maxLevel="month"
            getDayProps={(date) => ({
              disabled: dayjs(date).isBefore(dayjs(minDate), "day"),
            })}
            styles={{
              datePickerRoot: { width: "100%" },
              month: { width: "100%" },
              monthCell: { width: "14.2857%" },
              calendarHeader: { maxWidth: "100%" },
              calendarHeaderLevel: {
                flex: 1,
                textAlign: "center",
                fontWeight: 700,
                color: uiColors.textPrimary,
              },
              calendarHeaderControl: {
                border: `1px solid ${uiColors.border}`,
                color: uiColors.textSecondary,
              },
              day: {
                borderRadius: 999,
                width: "100%",
                fontWeight: 500,
              },
              weekday: {
                color: uiColors.textSecondary,
                fontWeight: 600,
              },
            }}
          />

          <Card
            radius="lg"
            p="sm"
            style={{
              background: uiColors.surfaceAlt,
              border: `1px solid ${uiColors.border}`,
            }}
          >
            <Text size="xs" c={uiColors.textSecondary}>
              Selected date
            </Text>
            <Text fw={700} c={uiColors.textPrimary}>
              {label}
            </Text>
          </Card>
        </Stack>
      </Card>
    </Stack>
  );
}
