import { Box, Card, Chip, Group, Stack, Text, Title } from "@mantine/core";

export function HeroBanner() {
  return (
    <Card
      radius="md"
      p="lg"
      style={{
        border: "1px solid #cfd9d5",
        background:
          "repeating-linear-gradient(-45deg, #f7faf8 0, #f7faf8 12px, #eef3f0 12px, #eef3f0 24px)",
        boxShadow: "none",
      }}
    >
      <Stack gap={10}>
        <Text size="sm" fw={700} c="#75857f" tt="uppercase">
          Main banner
        </Text>
        <Title order={2} size="h2" c="#1f2c2a">
          Today&apos;s dining benefits
        </Title>
        <Text size="sm" c="#7d8b86">
          Banner area
        </Text>
      </Stack>
    </Card>
  );
}

export function CityTileGrid({
  items,
  selectedValue,
  onSelect,
}: {
  items: Array<{ label: string; badge?: string; background: string }>;
  selectedValue?: string;
  onSelect?: (value: string) => void;
}) {
  return (
    <Group grow gap="sm" wrap="nowrap">
      {items.map((item) => (
        <Stack
          key={item.label}
          gap={6}
          align="center"
          style={{ cursor: onSelect ? "pointer" : "default" }}
          onClick={() => onSelect?.(item.label)}
        >
          <Box
            w="100%"
            style={{
              height: 42,
              borderRadius: 8,
              background: item.background,
              position: "relative",
              overflow: "hidden",
              border:
                item.label === selectedValue
                  ? "2px solid #007487"
                  : "1px solid #d5dfdc",
              boxShadow:
                item.label === selectedValue
                  ? "0 6px 16px rgba(0,116,135,0.12)"
                  : "none",
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
            fw={item.label === selectedValue ? 700 : 600}
            size="xs"
            c="#23312c"
          >
            {item.label}
          </Text>
        </Stack>
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
        <Chip
          key={item}
          radius="xl"
          size="sm"
          checked={item === selectedValue}
          onChange={() => onChange?.(item)}
          styles={{
            root: { width: "fit-content" },
            label: {
              width: "fit-content",
              textAlign: "center",
              borderRadius: 999,
              background: "#ffffff",
              border: item === selectedValue ? "1px solid #007487" : "1px solid #cfd9d5",
              minHeight: compact ? 32 : 36,
              paddingLeft: compact ? 12 : 14,
              paddingRight: compact ? 12 : 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#23312c",
              fontWeight: item === selectedValue ? 700 : 500,
              boxShadow: "none",
            },
            iconWrapper: { display: "none" },
          }}
        >
          {item}
        </Chip>
      ))}
    </Group>
  );
}
