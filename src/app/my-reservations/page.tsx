import Link from "next/link";
import { Badge, Button, Card, Group, Stack, Text } from "@mantine/core";
import { IconSwitchHorizontal } from "@tabler/icons-react";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { MobileShell } from "@/components/app-shell/mobile-shell";
import { uiColors } from "@/theme";

const profileSections = [
  { title: "Account", description: "Name, phone number, and email preferences" },
  { title: "Security", description: "Password, login activity, and device management" },
  { title: "Payment methods", description: "Saved cards and payment preferences" },
  { title: "Notifications", description: "Reservation alerts, promotions, and reminders" },
  { title: "Support", description: "Help center, terms, and contact information" },
];

export default function MyReservationsPage() {
  return (
    <MobileShell
      title="My Account"
      subtitle="Manage account details, security, and app settings."
      bottomNav={<BottomNav activePath="/my-reservations" />}
    >
      <Card
        radius="xl"
        p="lg"
        style={{
          border: "1px solid rgba(207, 183, 145, 0.24)",
          background: "rgba(255,251,247,0.88)",
          boxShadow: "0 12px 28px rgba(100, 71, 34, 0.06)",
        }}
      >
        <Group justify="space-between" align="center">
          <Stack gap={4}>
            <Text fw={700} size="lg">
              Minh Lam
            </Text>
            <Text size="sm" c="#68716c">
              minh.lam@example.com
            </Text>
          </Stack>

          <Badge radius="xl" color="oligoTeal" variant="light">
            Verified
          </Badge>
        </Group>
      </Card>

      <Card
        radius="lg"
        p="lg"
        style={{
          border: `1px solid ${uiColors.border}`,
          background: uiColors.brandPrimarySoft,
          boxShadow: "none",
        }}
      >
        <Stack gap="md">
          <Stack gap={4}>
            <Text fw={750} size="lg" c={uiColors.textPrimary}>
              Restaurant workspace
            </Text>
            <Text size="sm" c={uiColors.textSecondary}>
              Manage reservations, guest arrivals, marketing, and store
              settings.
            </Text>
          </Stack>

          <Link href="/owner" style={{ textDecoration: "none" }}>
            <Button
              fullWidth
              radius="md"
              leftSection={<IconSwitchHorizontal size={18} />}
            >
              Switch to Owner workspace
            </Button>
          </Link>
        </Stack>
      </Card>

      {profileSections.map((section) => (
        <Card
          key={section.title}
          radius="xl"
          p="lg"
          style={{
            border: "1px solid rgba(207, 183, 145, 0.24)",
            background: "rgba(255,251,247,0.88)",
            boxShadow: "0 12px 28px rgba(100, 71, 34, 0.06)",
          }}
        >
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Text fw={700} size="lg">
                {section.title}
              </Text>
              <Text size="sm" c="#68716c">
                {section.description}
              </Text>
            </Stack>

            <Badge color="sand" variant="light" radius="xl">
              Manage
            </Badge>
          </Group>
        </Card>
      ))}
    </MobileShell>
  );
}
