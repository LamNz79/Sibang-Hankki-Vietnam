import {
  ActionIcon,
  Box,
  Button,
  Card,
  Group,
  Indicator,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconAdjustmentsHorizontal,
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { uiColors } from "@/theme";

type OwnerDashboardToolbarProps = {
  dateLabel: string;
  isToday: boolean;
  searchQuery: string;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onReturnToToday: () => void;
  onSearchChange: (value: string) => void;
  onOpenFilters: () => void;
};

/** Sticky date, search, and filter controls for the owner dashboard. */
export function OwnerDashboardToolbar({
  dateLabel,
  isToday,
  searchQuery,
  hasActiveFilters,
  activeFilterCount,
  onPreviousDay,
  onNextDay,
  onReturnToToday,
  onSearchChange,
  onOpenFilters,
}: OwnerDashboardToolbarProps) {
  const t = useTranslations("OwnerDashboard.toolbar");

  return (
    <Box
      style={{
        position: "sticky",
        top: -16,
        zIndex: 10,
        marginInline: -4,
        padding: "0 4px 10px",
        background: uiColors.appBackground,
      }}
    >
      <Stack gap="sm">
        <Card
          radius="lg"
          p="sm"
          style={{
            background: uiColors.surface,
            border: `1px solid ${uiColors.border}`,
          }}
        >
          <Group justify="space-between" wrap="nowrap">
            <ActionIcon
              variant="light"
              color="gray"
              radius="md"
              aria-label={t("previousDay")}
              onClick={onPreviousDay}
            >
              <IconChevronLeft size={18} />
            </ActionIcon>
            <Stack gap={0} align="center">
              <Text fw={800} c={uiColors.textPrimary}>
                {dateLabel}
              </Text>
              {!isToday ? (
                <Button
                  variant="subtle"
                  color="warmCoral"
                  size="compact-xs"
                  onClick={onReturnToToday}
                >
                  {t("returnToday")}
                </Button>
              ) : null}
            </Stack>
            <ActionIcon
              variant="light"
              color="gray"
              radius="md"
              aria-label={t("nextDay")}
              onClick={onNextDay}
            >
              <IconChevronRight size={18} />
            </ActionIcon>
          </Group>
        </Card>

        <Group gap="sm" wrap="nowrap" align="center">
          <TextInput
            value={searchQuery}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
            size="md"
            radius="lg"
            leftSection={<IconSearch size={18} />}
            rightSection={
              searchQuery ? (
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  radius="xl"
                  aria-label={t("clearSearch")}
                  onClick={() => onSearchChange("")}
                >
                  <IconX size={16} />
                </ActionIcon>
              ) : null
            }
            styles={{
              root: { flex: 1, minWidth: 0 },
              input: {
                height: 44,
                background: uiColors.surface,
                borderColor: uiColors.border,
              },
            }}
          />

          <Indicator
            inline
            disabled={activeFilterCount === 0}
            label={activeFilterCount}
            size={18}
            color="warmCoral"
            offset={4}
          >
            <ActionIcon
              size={44}
              radius="lg"
              variant={hasActiveFilters ? "light" : "default"}
              color="warmCoral"
              aria-label={t("filter")}
              onClick={onOpenFilters}
              style={{
                border: `1px solid ${
                  hasActiveFilters ? uiColors.brandPrimary : uiColors.border
                }`,
              }}
            >
              <IconAdjustmentsHorizontal size={20} />
            </ActionIcon>
          </Indicator>
        </Group>
      </Stack>
    </Box>
  );
}
