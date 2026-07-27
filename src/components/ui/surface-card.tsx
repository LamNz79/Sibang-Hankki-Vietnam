import { Card, type CardProps } from "@mantine/core";
import { uiColors, uiRadii } from "@/theme";

type SurfaceCardTone = "default" | "muted" | "brand";

export type SurfaceCardProps = CardProps & {
  tone?: SurfaceCardTone;
};

const toneBackgrounds: Record<SurfaceCardTone, string> = {
  default: uiColors.surface,
  muted: uiColors.surfaceAlt,
  brand: uiColors.brandPrimarySoft,
};

export function SurfaceCard({
  tone = "default",
  radius = uiRadii.card,
  style,
  ...props
}: SurfaceCardProps) {
  return (
    <Card
      radius={radius}
      style={[
        {
          background: toneBackgrounds[tone],
          border: `1px solid ${uiColors.border}`,
          boxShadow: "none",
        },
        style,
      ]}
      {...props}
    />
  );
}
