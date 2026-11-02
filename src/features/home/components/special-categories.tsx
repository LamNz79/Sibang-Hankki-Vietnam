import { Card, ThemeIcon, Text } from '@mantine/core'
import { IconProps } from '@tabler/icons-react';
import React, { ForwardRefExoticComponent, RefAttributes } from 'react'
import { uiColors } from "@/theme";
type SpecialCategoryProps = {
  item: {
    label: string;
    slug: string;
    icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
    image: string;
  }
}
export function SpecialCategories(specialCategoryProps: SpecialCategoryProps) {
  const { item } = specialCategoryProps;
  const Icon = item.icon;

  return (
    <Card
      radius="md"
      p="sm"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(20, 12, 8, 0.12), rgba(20, 12, 8, 0.72)), url("${item.image}")`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        border: `1px solid ${uiColors.border}`,
        height: 96,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <ThemeIcon
        variant="transparent"
        radius="xl"
        size={28}
        mx="auto"
        style={{
          color: "white",
          background: "rgba(0, 0, 0, 0.24)",
          marginTop: 2,
        }}
      >
        <Icon size={20} />
      </ThemeIcon>
      <Text
        size="xs"
        fw={600}
        c="white"
        ta="center"
        lh={1.25}
        style={{
          minHeight: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textShadow: "0 1px 4px rgba(0, 0, 0, 0.75)",
        }}
      >
        {item.label}
      </Text>
    </Card>)
}
