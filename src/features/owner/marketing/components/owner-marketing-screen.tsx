"use client";

import { useState } from "react";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import {
  IconChevronRight,
  IconPlus,
  IconSpeakerphone,
} from "@tabler/icons-react";
import { OwnerShell } from "@/features/owner/shared";
import { ownerCampaigns } from "@/features/owner/data/mock-data";
import { MetricCard, PrimaryActionButton } from "@/components/ui";
import { uiColors } from "@/theme";

export function OwnerMarketingScreen() {
  const [campaignOpened, setCampaignOpened] = useState(false);
  const openCampaign = () => setCampaignOpened(true);

  return (
    <>
      <OwnerShell
        title="Marketing"
        eyebrow="Campaign performance"
        headerAction={
          <ActionIcon
            variant="light"
            color="gray"
            radius="xl"
            size={40}
            aria-label="Create campaign"
            onClick={openCampaign}
          >
            <IconPlus size={22} />
          </ActionIcon>
        }
        footerAction={
          <PrimaryActionButton
            leftSection={<IconPlus size={20} />}
            onClick={openCampaign}
          >
            Create campaign
          </PrimaryActionButton>
        }
      >
        <Stack gap="md">
          <Card
            radius="lg"
            p="md"
            style={{
              background: uiColors.brandPrimarySoft,
              border: `1px solid ${uiColors.borderStrong}`,
            }}
          >
            <Group wrap="nowrap">
              <ThemeIcon
                size={44}
                radius="xl"
                variant="light"
                color="warmCoral"
              >
                <IconSpeakerphone size={21} />
              </ThemeIcon>
              <Stack gap={2} style={{ flex: 1 }}>
                <Text size="xs" c={uiColors.textSecondary}>
                  Active campaign
                </Text>
                <Text fw={800}>Weekday table benefit</Text>
                <Text size="xs" c={uiColors.textSecondary}>
                  Extra points for 14:00–17:00 bookings
                </Text>
              </Stack>
              <IconChevronRight size={18} color={uiColors.brandPrimary} />
            </Group>
          </Card>

          <SimpleGrid cols={2} spacing="sm">
            <MetricCard value="86" label="Attributed bookings" />
            <MetricCard value="₫18.6M" label="Expected sales" />
          </SimpleGrid>

          <Card
            radius="lg"
            px={{ base: "md", md: "lg" }}
            py="sm"
            style={{
              background: uiColors.surface,
              border: `1px solid ${uiColors.border}`,
            }}
          >
            <Group justify="space-between" py="xs">
              <Text fw={800}>Campaigns</Text>
              <Text size="xs" c={uiColors.textSecondary}>
                View all
              </Text>
            </Group>
            {ownerCampaigns.map((campaign) => (
              <Group
                key={campaign.id}
                wrap="nowrap"
                py="md"
                style={{ borderTop: `1px solid ${uiColors.border}` }}
              >
                <ThemeIcon
                  size={8}
                  radius="xl"
                  style={{ background: campaign.color }}
                />
                <Stack gap={2} style={{ flex: 1 }}>
                  <Text fw={700} size="sm">
                    {campaign.name}
                  </Text>
                  <Text size="xs" c={uiColors.textSecondary}>
                    {campaign.status} · {campaign.detail}
                  </Text>
                </Stack>
                <Text fw={800} c={uiColors.brandPrimary}>
                  {campaign.bookings}
                </Text>
              </Group>
            ))}
          </Card>
        </Stack>
      </OwnerShell>

      <Modal
        opened={campaignOpened}
        onClose={() => setCampaignOpened(false)}
        title={<Text fw={800}>Create campaign</Text>}
        centered
        radius="lg"
      >
        <Stack gap="md">
          <Text size="sm" c={uiColors.textSecondary}>
            Prototype only. Campaign publishing and attribution will be
            connected later.
          </Text>
          <TextInput label="Campaign name" placeholder="Campaign name" />
          <Select
            label="Benefit type"
            placeholder="Choose a benefit"
            data={["Special deal", "Coupon", "Points", "Banner"]}
          />
          <Group grow>
            <Button
              variant="default"
              onClick={() => setCampaignOpened(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setCampaignOpened(false)}>
              Save draft
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
