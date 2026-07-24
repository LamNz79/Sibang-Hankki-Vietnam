import {
  Button,
  Card,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconBuildingStore,
  IconCalendarEvent,
  IconChevronRight,
  IconClock,
  IconCreditCard,
  IconToolsKitchen3,
  IconArmchair,
} from "@tabler/icons-react";
import { OwnerShell } from "@/components/owner/owner-shell";
import { uiColors } from "@/theme";

const settings = [
  {
    title: "Business hours",
    detail: "11:30–22:00",
    icon: IconClock,
  },
  {
    title: "Booking availability",
    detail: "30-minute slots · 30 days ahead",
    icon: IconCalendarEvent,
  },
  {
    title: "Seating and tables",
    detail: "48 seats · 16 tables",
    icon: IconArmchair,
  },
  {
    title: "Menus and pre-orders",
    detail: "36 menu items · 8 pre-orders",
    icon: IconToolsKitchen3,
  },
  {
    title: "Payment methods",
    detail: "Card · MoMo · pay at restaurant",
    icon: IconCreditCard,
  },
];

export default function OwnerSettingsPage() {
  return (
    <OwnerShell
      title="Store settings"
      eyebrow="Service configuration"
      backHref="/owner"
      hideMobileNavigation
      footerAction={<Button fullWidth>Save changes</Button>}
    >
      <Stack gap="md">
        <Card
          radius="lg"
          p="md"
          style={{
            background: uiColors.surface,
            border: `1px solid ${uiColors.border}`,
          }}
        >
          <Group wrap="nowrap">
            <ThemeIcon
              size={44}
              radius="md"
              variant="light"
              color="oligoTeal"
            >
              <IconBuildingStore size={22} />
            </ThemeIcon>
            <Stack gap={2} style={{ flex: 1 }}>
              <Text fw={800}>The Royal Pavilion</Text>
              <Text size="xs" c={uiColors.textSecondary}>
                District 1 · Chinese
              </Text>
            </Stack>
            <IconChevronRight size={18} color={uiColors.textMuted} />
          </Group>
        </Card>

        <Card
          radius="lg"
          px="md"
          py={0}
          style={{
            background: uiColors.surface,
            border: `1px solid ${uiColors.border}`,
          }}
        >
          {settings.map((setting) => {
            const Icon = setting.icon;
            return (
              <Group
                key={setting.title}
                wrap="nowrap"
                py="md"
                style={{ borderBottom: `1px solid ${uiColors.border}` }}
              >
                <ThemeIcon
                  size={36}
                  radius="md"
                  variant="light"
                  color="oligoTeal"
                >
                  <Icon size={18} />
                </ThemeIcon>
                <Stack gap={2} style={{ flex: 1 }}>
                  <Text fw={750} size="sm">
                    {setting.title}
                  </Text>
                  <Text size="xs" c={uiColors.textSecondary}>
                    {setting.detail}
                  </Text>
                </Stack>
                <IconChevronRight size={17} color={uiColors.textMuted} />
              </Group>
            );
          })}
        </Card>
      </Stack>
    </OwnerShell>
  );
}
