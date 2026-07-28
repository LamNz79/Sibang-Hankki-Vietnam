import { Button, type ButtonProps } from "@mantine/core";
import type { ComponentPropsWithoutRef } from "react";
import { uiRadii } from "@/theme";

type NativeButtonProps = ComponentPropsWithoutRef<"button">;

export type PrimaryActionButtonProps = ButtonProps &
  Omit<NativeButtonProps, keyof ButtonProps>;

export function PrimaryActionButton({
  fullWidth = true,
  size = "md",
  radius = uiRadii.control,
  ...props
}: PrimaryActionButtonProps) {
  return (
    <Button
      fullWidth={fullWidth}
      size={size}
      radius={radius}
      {...props}
    />
  );
}
