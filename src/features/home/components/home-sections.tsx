import Link from "next/link";
import { Box, Card, Group, Stack, Text, Title } from "@mantine/core";
import { SelectionChip } from "@/components/ui";
import { useTranslations } from "next-intl";
import { uiColors } from "@/theme";

export function HeroBanner() {
  const t = useTranslations("Home.banner");
  return (
    <Card
      radius="md"
      p="lg"
      style={{
        border: `1px solid ${uiColors.borderStrong}`,
        backgroundImage:
          "linear-gradient(90deg, rgba(26, 12, 7, 0.82), rgba(26, 12, 7, 0.18)), url('/images/sample/restaurants/royal-pavilion-dining-hall.jpg')",
        backgroundPosition: "center",
        backgroundSize: "cover",
        boxShadow: "none",
        minHeight: 160,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Stack gap={10}>
        <Text size="sm" fw={700} c="white" tt="uppercase">
          {t("eyebrow")}
        </Text>
        <Title order={2} size="h2" c="white">
          {t("title")}
        </Title>
        <Text size="sm" c="white">
          {t("description")}
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
              height: 72,
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
