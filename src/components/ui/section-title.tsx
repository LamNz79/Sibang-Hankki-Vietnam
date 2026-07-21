import { Title } from "@mantine/core";

type SectionTitleProps = {
  title: string;
};

export function SectionTitle({ title }: SectionTitleProps) {
  return (
    <Title order={2} size={22} fw={600} c="#20312c">
      {title}
    </Title>
  );
}
