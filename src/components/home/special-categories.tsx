import { Card, ThemeIcon, Text } from '@mantine/core'
import { IconProps } from '@tabler/icons-react';
import React, { ForwardRefExoticComponent, RefAttributes } from 'react'
type SpecialCategoryProps = {
  item: {
    label: string;
    slug: string;
    icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
    color: string;
  }
}
export default function SpecialCategories(specialCategoryProps: SpecialCategoryProps) {
  const { item } = specialCategoryProps;
  const Icon = item.icon;

  return (
    <Card
      radius="md"
      p="sm"
      style={{
        background: "#fbfcfc",
        border: "1px solid #d5dfdc",
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
          color: item.color,
          background: "transparent",
          marginTop: 2,
        }}
      >
        <Icon size={20} />
      </ThemeIcon>
      <Text
        size="xs"
        fw={600}
        c="#24322e"
        ta="center"
        lh={1.25}
        style={{
          minHeight: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {item.label}
      </Text>
    </Card>)
}
