import Link from "next/link";
import { Box, Card, Group, Stack, Text, Title } from "@mantine/core";
import { SelectionChip } from "@/components/ui/selection-chip";
import { uiColors } from "@/theme";

export function HeroBanner() {
  return (
    <Card
      radius="md"
      p="lg"
      style={{
        border: `1px solid ${uiColors.borderStrong}`,
        background:
          "repeating-linear-gradient(-45deg, #fff7f3 0, #fff7f3 12px, #fce9e2 12px, #fce9e2 24px)",
        boxShadow: "none",
      }}
    >
      <Stack gap={10}>
        <Text size="sm" fw={700} c={uiColors.brandPrimaryMuted} tt="uppercase">
          Main banner
        </Text>
        <Title order={2} size="h2" c={uiColors.textPrimary}>
          Today&apos;s dining benefits
        </Title>
        <Text size="sm" c={uiColors.textSecondary}>
          Banner area
        </Text>
      </Stack>
    </Card>
  );
}

export function CityTileGrid({
  items,
}: {
  items: Array<{ label: string; slug: string; badge?: string; background: string }>;
}) {
  return (
    <Group grow gap="sm" wrap="nowrap">
      {items.map((item) => (
        <Link
          key={item.label}
          href={`/restaurants?city=${item.slug}`}
          style={{ flex: 1, color: "inherit", textDecoration: "none" }}
        >
          <Stack gap={6} align="center" style={{ cursor: "pointer" }}>
          <Box
            w="100%"
            style={{
              height: 42,
              borderRadius: 8,
              background: item.background,
              position: "relative",
              overflow: "hidden",
              border: `1px solid ${uiColors.border}`,
              boxShadow: "none",
            }}
          >
            <Box
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.16) 100%)",
              }}
            />
          </Box>
          <Text
            ta="center"
            fw={600}
            size="xs"
            c={uiColors.textPrimary}
          >
            {item.label}
          </Text>
          </Stack>
        </Link>
      ))}
    </Group>
  );
}

export function ChipRow({
  items,
  value,
  defaultValue,
  onChange,
  compact = false,
}: {
  items: string[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  compact?: boolean;
}) {
  const selectedValue = value ?? defaultValue;

  return (
    <Group gap="xs" align="flex-start">
      {items.map((item) => (
        <SelectionChip
          key={item}
          checked={item === selectedValue}
          onChange={() => onChange?.(item)}
          compact={compact}
        >
          {item}
        </SelectionChip>
      ))}
    </Group>
  );
}
