import {
  Badge,
  Box,
  Card,
  Chip,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { quickStats } from "@/components/home/home-data";

export function HeroBanner() {
  return (
    <Card
      radius={28}
      padding={0}
      style={{
        overflow: "hidden",
        background: "#0d3943",
        boxShadow: "0 18px 40px rgba(0, 70, 82, 0.22)",
      }}
    >
      <Stack gap={0}>
        <Group
          justify="space-between"
          px={22}
          py={16}
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <Badge radius="xl" variant="filled" color="oligoOrange">
            Oligo dining flow
          </Badge>
          <Text size="sm" c="rgba(255,255,255,0.72)">
            Built for mobile
          </Text>
        </Group>

        <Stack gap={18} p={22}>
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={10} maw={240}>
              <Title order={2} size={30} fw={650} c="white">
                Book faster, arrive with confidence
              </Title>
              <Text size="md" c="rgba(255,255,255,0.78)">
                A cleaner reservation experience for Sibang Hankki customers
                across different branches.
              </Text>
            </Stack>

            <Box
              w={104}
              h={116}
              style={{
                flexShrink: 0,
                borderRadius: 24,
                background:
                  "linear-gradient(180deg, rgba(191,110,60,0.95) 0%, rgba(120,67,33,0.98) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16)",
              }}
            >
              <Box
                w={56}
                h={56}
                style={{
                  borderRadius: 18,
                  border: "3px solid rgba(255,255,255,0.92)",
                }}
              />
            </Box>
          </Group>

          <Group grow align="stretch">
            {quickStats.map((item) => (
              <Card
                key={item.label}
                radius="xl"
                p="sm"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Text size="lg" fw={700} c="white">
                  {item.value}
                </Text>
                <Text size="xs" c="rgba(255,255,255,0.68)">
                  {item.label}
                </Text>
              </Card>
            ))}
          </Group>
        </Stack>
      </Stack>
    </Card>
  );
}

export function SectionTitle({ title }: { title: string }) {
  return (
    <Title order={2} size={22} fw={600} c="#20312c">
      {title}
    </Title>
  );
}

export function FilterSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      radius="xl"
      p="lg"
      style={{
        background: "rgba(255, 251, 247, 0.86)",
        border: "1px solid rgba(207, 183, 145, 0.18)",
        boxShadow: "0 10px 24px rgba(100, 71, 34, 0.05)",
      }}
    >
      <Stack gap="md">
        <Box>
          <Text fw={700} size="lg" c="#20312c">
            {title}
          </Text>
          <Text size="sm" c="#7c7368" mt={4}>
            {description}
          </Text>
        </Box>
        {children}
      </Stack>
    </Card>
  );
}

export function CityTileGrid({
  items,
}: {
  items: Array<{ label: string; badge?: string; background: string }>;
}) {
  return (
    <Group gap="md" wrap="nowrap" style={{ overflowX: "auto" }} className="hide-scrollbar">
      {items.map((item) => (
        <Stack key={item.label} gap={8} align="center" style={{ minWidth: 92 }}>
          <Box
            w={92}
            style={{
              aspectRatio: "1 / 1",
              borderRadius: 24,
              background: item.background,
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 12px 24px rgba(100, 71, 34, 0.10)",
            }}
          >
            <Box
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.18) 100%)",
              }}
            />
            {item.badge ? (
              <Badge
                size="xs"
                radius="xl"
                color="oligoOrange"
                variant="filled"
                style={{ position: "absolute", left: 8, bottom: 8 }}
              >
                {item.badge}
              </Badge>
            ) : null}
          </Box>
          <Text ta="center" fw={600} size="sm" c="#23312c">
            {item.label}
          </Text>
        </Stack>
      ))}
    </Group>
  );
}

export function ChipRow({
  items,
  defaultValue,
  compact = false,
}: {
  items: string[];
  defaultValue?: string;
  compact?: boolean;
}) {
  return (
    <Group gap="sm" align="flex-start">
      {items.map((item) => (
        <Chip
          key={item}
          radius="xl"
          size="lg"
          defaultChecked={item === defaultValue}
          styles={{
            root: { width: "fit-content" },
            label: {
              width: "fit-content",
              textAlign: "center",
              borderRadius: 999,
              background: item === defaultValue ? "#007487" : "#f8f1e8",
              border: "1px solid rgba(205, 183, 151, 0.2)",
              minHeight: compact ? 40 : 44,
              paddingLeft: compact ? 14 : 18,
              paddingRight: compact ? 14 : 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: item === defaultValue ? "#ffffff" : "#23312c",
              fontWeight: item === defaultValue ? 700 : 500,
              boxShadow:
                item === defaultValue
                  ? "0 10px 18px rgba(0, 116, 135, 0.18)"
                  : "none",
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
