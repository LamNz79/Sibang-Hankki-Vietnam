import { Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";
import type { Icon } from "@tabler/icons-react";
import { SurfaceCard, type SurfaceCardProps } from "@/components/ui/surface-card";
import { uiColors } from "@/theme";

export type MetricCardProps = Omit<SurfaceCardProps, "children"> & {
  value: ReactNode;
  label: ReactNode;
  icon?: Icon;
};

export function MetricCard({
  value,
  label,
  icon: MetricIcon,
  p = "md",
  ...props
}: MetricCardProps) {
  return (
    <SurfaceCard p={p} {...props}>
      <Stack gap={6}>
        {MetricIcon ? (
          <MetricIcon size={20} color={uiColors.brandPrimary} />
        ) : null}
        <Title order={2} size="h3" c={uiColors.textPrimary}>
          {value}
        </Title>
        <Text size="xs" c={uiColors.textSecondary}>
          {label}
        </Text>
      </Stack>
    </SurfaceCard>
  );
}
