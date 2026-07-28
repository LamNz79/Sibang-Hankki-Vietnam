import { Button, type ButtonProps } from "@mantine/core";
import type { ComponentPropsWithoutRef } from "react";
import { uiColors, uiRadii } from "@/theme";

type NativeButtonProps = ComponentPropsWithoutRef<"button">;

export type ChoiceButtonProps = Omit<
  ButtonProps,
  "color" | "styles" | "variant"
> &
  Omit<NativeButtonProps, keyof ButtonProps> & {
    selected?: boolean;
  };

export function ChoiceButton({
  selected = false,
  radius = uiRadii.control,
  style,
  ...props
}: ChoiceButtonProps) {
  return (
    <Button
      variant="default"
      radius={radius}
      style={[
        {
          height: 54,
          border: `1px solid ${
            selected ? uiColors.brandPrimary : uiColors.borderStrong
          }`,
          background: selected
            ? uiColors.brandPrimarySoft
            : uiColors.surface,
          color: selected ? uiColors.brandPrimary : uiColors.textPrimary,
          boxShadow: "none",
        },
        style,
      ]}
      styles={{ label: { fontWeight: 750 } }}
      {...props}
    />
  );
}
