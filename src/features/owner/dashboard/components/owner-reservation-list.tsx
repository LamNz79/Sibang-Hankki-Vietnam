import { Box, Card, Group, Stack, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";
import { OwnerReservationRow } from "@/features/owner/reservations";
import type { OwnerReservation } from "@/features/owner/types";
import { uiColors } from "@/theme";

type OwnerReservationListProps = {
  reservations: OwnerReservation[];
  searchQuery: string;
};

/** Displays the filtered owner reservation schedule and its empty state. */
export function OwnerReservationList({
  reservations,
  searchQuery,
}: OwnerReservationListProps) {
  const t = useTranslations("OwnerDashboard.list");

  return (
    <Card
      radius="lg"
      px={{ base: "md", md: "lg" }}
      py={0}
      style={{
        background: uiColors.surface,
        border: `1px solid ${uiColors.border}`,
        boxShadow: "none",
      }}
    >
      <Group justify="space-between" pt="md" pb="xs" wrap="nowrap">
        <Title order={2} size="h4" c={uiColors.textPrimary}>
          {t("title")}
        </Title>
        <Text size="xs" c={uiColors.textSecondary}>
          {t("shown", { count: reservations.length })}
        </Text>
      </Group>

      {reservations.length > 0 ? (
        <Box>
          {reservations.map((reservation) => (
            <OwnerReservationRow
              key={reservation.id}
              reservation={reservation}
            />
          ))}
        </Box>
      ) : (
        <Stack align="center" gap={4} py="xl">
          <Text fw={700} c={uiColors.textPrimary}>
            {t(searchQuery ? "searchEmptyTitle" : "filterEmptyTitle")}
          </Text>
          <Text size="sm" ta="center" c={uiColors.textSecondary}>
            {t(searchQuery ? "searchEmptyDescription" : "filterEmptyDescription")}
          </Text>
        </Stack>
      )}
    </Card>
  );
}
