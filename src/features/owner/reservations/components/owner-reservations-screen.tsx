"use client";

import { useMemo, useState } from "react";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Modal,
  NumberInput,
  SegmentedControl,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
} from "@tabler/icons-react";
import { OwnerShell } from "@/features/owner/shared";
import { ownerReservations } from "@/features/owner/data/mock-data";
import { PrimaryActionButton } from "@/components/ui";
import { OwnerReservationRow } from "./owner-reservation-row";
import { uiColors } from "@/theme";

type ReservationFilter = "all" | "confirmed" | "vip" | "preorder";

export function OwnerReservationsScreen() {
  const [filter, setFilter] = useState<ReservationFilter>("all");
  const [walkInOpened, setWalkInOpened] = useState(false);

  const reservations = useMemo(() => {
    if (filter === "confirmed") {
      return ownerReservations.filter(
        (reservation) => reservation.status === "confirmed",
      );
    }
    if (filter === "vip") {
      return ownerReservations.filter(
        (reservation) => reservation.tier === "vip",
      );
    }
    if (filter === "preorder") {
      return ownerReservations.filter((reservation) => reservation.preOrder);
    }
    return ownerReservations;
  }, [filter]);

  const openWalkIn = () => setWalkInOpened(true);

  return (
    <>
      <OwnerShell
        title="Reservations"
        eyebrow="Service board"
        headerAction={
          <ActionIcon
            variant="light"
            color="gray"
            radius="xl"
            size={40}
            aria-label="Add walk-in"
            onClick={openWalkIn}
          >
            <IconPlus size={22} />
          </ActionIcon>
        }
        footerAction={
          <PrimaryActionButton
            leftSection={<IconPlus size={20} />}
            onClick={openWalkIn}
          >
            Add walk-in
          </PrimaryActionButton>
        }
      >
        <Stack gap="md">
          <Card
            radius="lg"
            p="sm"
            style={{
              background: uiColors.surface,
              border: `1px solid ${uiColors.border}`,
            }}
          >
            <Group justify="space-between" wrap="nowrap">
              <ActionIcon variant="light" color="gray" radius="md">
                <IconChevronLeft size={18} />
              </ActionIcon>
              <Text fw={800} c={uiColors.textPrimary}>
                Monday, Jul 20
              </Text>
              <ActionIcon variant="light" color="gray" radius="md">
                <IconChevronRight size={18} />
              </ActionIcon>
            </Group>
          </Card>

          <SegmentedControl
            fullWidth
            value={filter}
            onChange={(value) => setFilter(value as ReservationFilter)}
            data={[
              { value: "all", label: `All ${ownerReservations.length}` },
              { value: "confirmed", label: "Confirmed" },
              { value: "vip", label: "VIP" },
              { value: "preorder", label: "Pre-order" },
            ]}
            color="oligoTeal"
            radius="xl"
            styles={{
              root: {
                background: uiColors.surface,
                border: `1px solid ${uiColors.border}`,
              },
            }}
          />

          <Card
            radius="lg"
            px={{ base: "md", md: "lg" }}
            py={0}
            style={{
              background: uiColors.surface,
              border: `1px solid ${uiColors.border}`,
            }}
          >
            {reservations.map((reservation) => (
              <OwnerReservationRow
                key={reservation.id}
                reservation={reservation}
              />
            ))}
          </Card>
        </Stack>
      </OwnerShell>

      <Modal
        opened={walkInOpened}
        onClose={() => setWalkInOpened(false)}
        title={<Text fw={800}>Add walk-in</Text>}
        centered
        radius="lg"
      >
        <Stack gap="md">
          <Text size="sm" c={uiColors.textSecondary}>
            UI placeholder for guests who arrive without an online reservation.
          </Text>
          <TextInput label="Guest name" placeholder="Enter guest name" />
          <TextInput label="Phone" placeholder="Optional phone number" />
          <NumberInput
            label="Party size"
            min={1}
            max={20}
            defaultValue={2}
          />
          <Textarea label="Notes" placeholder="Seating or allergy notes" />
          <Group grow>
            <Button
              variant="default"
              onClick={() => setWalkInOpened(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setWalkInOpened(false)}>Add guest</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
