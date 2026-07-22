import { Chip } from "@mantine/core";
import { uiColors } from "@/components/ui/theme-tokens";

type SelectionChipProps = {
  checked?: boolean;
  compact?: boolean;
  children: React.ReactNode;
  onChange?: () => void;
};

export function SelectionChip({
  checked = false,
  compact = false,
  children,
  onChange,
}: SelectionChipProps) {
  return (
    <Chip
      radius="xl"
      size="sm"
      checked={checked}
      onChange={onChange}
      styles={{
        root: { width: "fit-content" },
        label: {
          width: "fit-content",
          textAlign: "center",
          borderRadius: 999,
          background: uiColors.surface,
          border: checked
            ? `1px solid ${uiColors.brandPrimary}`
            : `1px solid ${uiColors.borderStrong}`,
          minHeight: compact ? 32 : 36,
          paddingLeft: compact ? 12 : 14,
          paddingRight: compact ? 12 : 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: uiColors.textPrimary,
          fontWeight: checked ? 700 : 500,
          boxShadow: "none",
        },
        iconWrapper: { display: "none" },
      }}
    >
      {children}
    </Chip>
  );
}
