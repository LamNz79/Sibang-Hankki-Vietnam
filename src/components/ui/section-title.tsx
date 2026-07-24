import { Title } from "@mantine/core";
import { uiColors } from "@/theme";

type SectionTitleProps = {
  title: string;
};

export function SectionTitle({ title }: SectionTitleProps) {
  return (
    <Title order={2} size={22} fw={600} c={uiColors.textPrimary}>
      {title}
    </Title>
  );
}
