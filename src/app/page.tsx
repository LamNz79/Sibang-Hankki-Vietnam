import {
  Card,
  Chip,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconFlame,
  IconHeart,
  IconPercentage,
  IconSearch,
  IconStar,
  IconTrendingUp,
} from "@tabler/icons-react";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { MobileShell } from "@/components/app-shell/mobile-shell";

const categories = [
  { label: "Michelin", icon: IconStar, color: "#d46d5b" },
  { label: "Buffet", icon: IconFlame, color: "#cb9830" },
  { label: "Deals", icon: IconPercentage, color: "#0f7e68" },
  { label: "Date Night", icon: IconHeart, color: "#cc6c73" },
  { label: "Trending", icon: IconTrendingUp, color: "#b78824" },
];

const cities = ["Ho Chi Minh", "Hanoi", "Da Nang"];
const cuisines = ["Western", "Chinese", "Vietnamese", "Japanese"];
const priceRanges = ["Under 150K", "150K~300K", "Over 300K"];

export default function Home() {
  return (
    <MobileShell
      title="Sibang Hanki"
      subtitle={undefined}
      bottomNav={<BottomNav activePath="/" />}
    >
      <TextInput
        radius="xl"
        size="md"
        placeholder="Search restaurants or cities"
        leftSection={<IconSearch size={16} />}
        styles={{
          input: {
            border: "1px solid rgba(202, 181, 150, 0.24)",
            background: "#f7f0e6",
            height: 52,
            color: "#22312d",
          },
        }}
      />

      <Card
        radius="xl"
        padding={20}
        style={{
          background: "linear-gradient(135deg, #0f5f56 0%, #16776d 54%, #209182 100%)",
          color: "white",
        }}
      >
        <Group justify="space-between" align="center" wrap="nowrap">
          <Stack gap={10}>
            <Title order={2} size={34} fw={500} c="white">
              Today&apos;s Dining Picks
            </Title>
            <Text size="lg" c="rgba(255,255,255,0.84)">
              Reserve now and enjoy benefits
            </Text>
            <Text size="sm" c="rgba(255,255,255,0.72)">
              1 / 3
            </Text>
          </Stack>

            <ThemeIcon
            size={120}
            radius="xl"
            style={{ background: "#37a89b", flexShrink: 0 }}
          >
            <ThemeIcon size={58} radius="xl" style={{ background: "#f1be69" }} />
          </ThemeIcon>
        </Group>
      </Card>

      <SectionTitle title="Featured Categories" />
      <SimpleGrid cols={5} spacing="sm">
        {categories.map((item) => {
          const Icon = item.icon;

          return (
            <Stack key={item.label} gap={8} align="center">
              <Card
                radius="xl"
                p="md"
                style={{
                  width: 64,
                  height: 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#f7f1e7",
                  boxShadow: "none",
                }}
              >
                <ThemeIcon
                  variant="light"
                  radius="xl"
                  size={34}
                  style={{
                    color: item.color,
                    background: "white",
                    border: `1px solid ${item.color}`,
                  }}
                >
                  <Icon size={18} />
                </ThemeIcon>
              </Card>
              <Text size="xs" ta="center">
                {item.label}
              </Text>
            </Stack>
          );
        })}
      </SimpleGrid>

      <SectionTitle title="City" />
      <ChipRow items={cities} defaultValue="Ho Chi Minh" />

      <SectionTitle title="Cuisine" />
      <ChipRow items={cuisines} />

      <SectionTitle title="Price Range" />
      <ChipRow items={priceRanges} />
    </MobileShell>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Title order={2} size={28} fw={500}>
      {title}
    </Title>
  );
}

function ChipRow({
  items,
  defaultValue,
}: {
  items: string[];
  defaultValue?: string;
}) {
  return (
    <SimpleGrid cols={items.length} spacing="sm">
      {items.map((item) => (
        <Chip
          key={item}
          radius="xl"
          size="lg"
          defaultChecked={item === defaultValue}
          styles={{
            root: {
              width: "100%",
            },
            label: {
              width: "100%",
              textAlign: "center",
              borderRadius: 999,
              background: "#f4ede4",
              border: "1px solid transparent",
              minHeight: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#23312c",
            },
            iconWrapper: {
              display: "none",
            },
          }}
        >
          {item}
        </Chip>
      ))}
    </SimpleGrid>
  );
}
