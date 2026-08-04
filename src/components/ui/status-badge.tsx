import { Badge, type BadgeProps } from "@mantine/core";
import { uiColors } from "@/theme";

type StatusBadgeTone =
  | "success"
  | "warning"
  | "info"
  | "error"
  | "neutral"
  | "brand";

export type StatusBadgeProps = Omit<
  BadgeProps,
  "color" | "styles" | "variant"
> & {
  tone?: StatusBadgeTone;
};

const toneStyles: Record<
  StatusBadgeTone,
  { background: string; color: string }
> = {
  success: {
    background: uiColors.statusSuccessSurface,
    color: uiColors.statusSuccessText,
  },
  warning: {
    background: uiColors.statusWarningSurface,
    color: uiColors.statusWarningText,
  },
  info: {
    background: uiColors.statusInfoSurface,
    color: uiColors.statusInfoText,
  },
  error: {
    background: uiColors.statusErrorSurface,
    color: uiColors.statusErrorText,
  },
  neutral: {
    background: uiColors.surfaceMuted,
    color: uiColors.textSecondary,
  },
  brand: {
    background: uiColors.accentVipSurface,
    color: uiColors.accentVipText,
  },
};

export function StatusBadge({
  tone = "neutral",
  radius = "sm",
  ...props
}: StatusBadgeProps) {
  return (
    <Badge
      radius={radius}
      variant="light"
      styles={{
        root: {
          ...toneStyles[tone],
          textTransform: "none",
          fontWeight: 700,
        },
      }}
      {...props}
    />
  );
}
