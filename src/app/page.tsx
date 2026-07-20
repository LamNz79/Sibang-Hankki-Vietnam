import {
  Badge,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconCalendarTime,
  IconMapPin,
  IconUsersGroup,
} from "@tabler/icons-react";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { MobileShell } from "@/components/app-shell/mobile-shell";

export default function Home() {
  return (
    <MobileShell
      title="Sibang Hankki"
      subtitle="Mobile-first customer app starter"
      bottomNav={<BottomNav activePath="/" />}
    >
      <Card radius="xl" padding={24} className="border border-white/70 bg-white/85 shadow-sm backdrop-blur">
        <Stack gap={18}>
          <Badge color="orange" variant="light" w="fit-content">
            MVP kickoff
          </Badge>
          <Title order={1} size={34} lh={1.08}>
            Discover restaurants and book a table in a clean customer flow.
          </Title>
          <Text c="dimmed" size="sm">
            We are now building this project as a mobile-view web app first, based on the
            customer wireframe and the reservation-focused MVP scope.
          </Text>
          <Group>
            <Button component="a" href="/restaurants" rightSection={<IconArrowRight size={16} />} size="md" radius="xl">
              Explore restaurants
            </Button>
          </Group>
        </Stack>
      </Card>

      <SimpleGrid cols={1} spacing="md">
        <FeatureCard
          icon={<IconMapPin size={18} />}
          title="Restaurant discovery"
          description="List, filter, and compare restaurants by area, cuisine, and availability."
        />
        <FeatureCard
          icon={<IconCalendarTime size={18} />}
          title="Reservation flow"
          description="Move from restaurant details into booking with date, time, and party size."
        />
        <FeatureCard
          icon={<IconUsersGroup size={18} />}
          title="My reservations"
          description="Give customers a clear place to review booking status and next actions."
        />
      </SimpleGrid>
    </MobileShell>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card radius="lg" padding="lg" withBorder>
      <Group align="flex-start" wrap="nowrap">
        <Badge color="teal" variant="light" circle size={42}>
          {icon}
        </Badge>
        <Stack gap={4}>
          <Text fw={700}>{title}</Text>
          <Text c="dimmed" size="sm">
            {description}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}
