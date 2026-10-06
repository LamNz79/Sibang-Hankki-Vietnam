"use client";

import { useState } from "react";
import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Group,
  Image,
  Loader,
  Modal,
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertCircle, IconEdit, IconPhoto, IconPlus, IconTrash } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/features/admin/components/admin-shell";
import type { MenuCategory, MenuItem } from "@/features/admin/data/owner-menu";
import { useOwnerMenu } from "@/features/admin/hooks/use-owner-menu";
import { uiColors } from "@/theme";

const emptyItem = {
  categoryId: null as string | null,
  name: "",
  description: "",
  price: 0,
  currency: "VND",
  imageUrl: "",
  available: true,
};

export function AdminMenuScreen() {
  const t = useTranslations("Admin.menu");
  const { query, mutations, error } = useOwnerMenu();
  const [categoryOpened, categoryModal] = useDisclosure(false);
  const [itemOpened, itemModal] = useDisclosure(false);
  const [category, setCategory] = useState({ id: "", name: "", displayOrder: 0 });
  const [item, setItem] = useState({ id: "", ...emptyItem });
  const categories = query.data?.categories ?? [];
  const items = query.data?.items ?? [];
  const pending = Object.values(mutations).some((mutation) => mutation.isPending);

  const openCategory = (value?: MenuCategory) => {
    setCategory(value ?? { id: "", name: "", displayOrder: categories.length });
    categoryModal.open();
  };
  const openItem = (value?: MenuItem) => {
    setItem(value
      ? { ...value, description: value.description ?? "", imageUrl: value.imageUrl ?? "" }
      : { id: "", ...emptyItem, categoryId: categories[0]?.id ?? null });
    itemModal.open();
  };
  const saveCategory = async () => {
    if (category.id) await mutations.updateCategory.mutateAsync(category);
    else await mutations.createCategory.mutateAsync(category);
    categoryModal.close();
  };
  const saveItem = async () => {
    const input = {
      ...item,
      description: item.description || null,
      imageUrl: item.imageUrl || null,
    };
    if (item.id) await mutations.updateItem.mutateAsync(input);
    else await mutations.createItem.mutateAsync(input);
    itemModal.close();
  };

  return (
    <AdminShell>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Stack gap={3}>
            <Title order={1}>{t("title")}</Title>
            <Text c={uiColors.textSecondary}>{t("description")}</Text>
          </Stack>
          <Group>
            <Button variant="default" leftSection={<IconPlus size={16} />} onClick={() => openCategory()}>
              {t("addCategory")}
            </Button>
            <Button color="warmCoral" leftSection={<IconPlus size={16} />} disabled={categories.length === 0} onClick={() => openItem()}>
              {t("addItem")}
            </Button>
          </Group>
        </Group>

        {error ? <Alert color="red" icon={<IconAlertCircle size={18} />}>{t("error")}</Alert> : null}
        {query.isLoading ? <Loader color="warmCoral" /> : null}

        {categories.map((menuCategory) => {
          const categoryItems = items.filter((menuItem) => menuItem.categoryId === menuCategory.id);
          return (
            <Card key={menuCategory.id} withBorder radius="sm" p={0}>
              <Group justify="space-between" px="md" py="sm" style={{ borderBottom: `1px solid ${uiColors.border}` }}>
                <Stack gap={0}>
                  <Text fw={800}>{menuCategory.name}</Text>
                  <Text size="xs" c={uiColors.textSecondary}>{t("itemCount", { count: categoryItems.length })}</Text>
                </Stack>
                <Group gap="xs">
                  <ActionIcon variant="subtle" aria-label={t("editCategory")} onClick={() => openCategory(menuCategory)}>
                    <IconEdit size={17} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    aria-label={t("deleteCategory")}
                    disabled={categoryItems.length > 0}
                    onClick={() => mutations.deleteCategory.mutate(menuCategory.id)}
                  >
                    <IconTrash size={17} />
                  </ActionIcon>
                </Group>
              </Group>
              {categoryItems.length === 0 ? (
                <Text p="md" c={uiColors.textSecondary}>{t("emptyCategory")}</Text>
              ) : categoryItems.map((menuItem) => (
                <Group key={menuItem.id} px="md" py="sm" wrap="nowrap" style={{ borderBottom: `1px solid ${uiColors.border}` }}>
                  {menuItem.imageUrl ? (
                    <Image src={menuItem.imageUrl} alt="" w={56} h={56} radius="sm" fit="cover" />
                  ) : (
                    <Card p="sm" radius="sm"><IconPhoto size={28} color={uiColors.textSecondary} /></Card>
                  )}
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Group gap="xs"><Text fw={750}>{menuItem.name}</Text><Text size="xs" c={menuItem.available ? "green" : "gray"}>{t(menuItem.available ? "available" : "unavailable")}</Text></Group>
                    {menuItem.description ? <Text size="xs" c={uiColors.textSecondary} lineClamp={1}>{menuItem.description}</Text> : null}
                  </Stack>
                  <Text fw={800}>{new Intl.NumberFormat("vi-VN").format(menuItem.price)} {menuItem.currency}</Text>
                  <ActionIcon variant="subtle" aria-label={t("editItem")} onClick={() => openItem(menuItem)}><IconEdit size={17} /></ActionIcon>
                  <ActionIcon variant="subtle" color="red" aria-label={t("deleteItem")} onClick={() => mutations.deleteItem.mutate(menuItem.id)}><IconTrash size={17} /></ActionIcon>
                </Group>
              ))}
            </Card>
          );
        })}

        {!query.isLoading && categories.length === 0 ? (
          <Card withBorder p="xl"><Text ta="center" c={uiColors.textSecondary}>{t("empty")}</Text></Card>
        ) : null}
      </Stack>

      <Modal opened={categoryOpened} onClose={categoryModal.close} title={t(category.id ? "editCategory" : "addCategory")}>
        <Stack>
          <TextInput required label={t("fields.categoryName")} value={category.name} maxLength={50} onChange={(event) => setCategory({ ...category, name: event.currentTarget.value })} />
          <NumberInput label={t("fields.displayOrder")} min={0} value={category.displayOrder} onChange={(value) => setCategory({ ...category, displayOrder: Number(value) || 0 })} />
          <Button color="warmCoral" loading={pending} disabled={!category.name.trim()} onClick={() => void saveCategory()}>{t("save")}</Button>
        </Stack>
      </Modal>

      <Modal opened={itemOpened} onClose={itemModal.close} title={t(item.id ? "editItem" : "addItem")}>
        <Stack>
          <Select required label={t("fields.category")} data={categories.map(({ id, name }) => ({ value: id, label: name }))} value={item.categoryId} onChange={(value) => setItem({ ...item, categoryId: value })} />
          <TextInput required label={t("fields.itemName")} maxLength={100} value={item.name} onChange={(event) => setItem({ ...item, name: event.currentTarget.value })} />
          <Textarea label={t("fields.description")} value={item.description ?? ""} onChange={(event) => setItem({ ...item, description: event.currentTarget.value })} />
          <Group grow align="flex-end">
            <NumberInput required label={t("fields.price")} min={0} decimalScale={2} value={item.price} onChange={(value) => setItem({ ...item, price: Number(value) || 0 })} />
            <Select label={t("fields.currency")} value={item.currency} data={["VND", "USD", "KRW"]} onChange={(value) => setItem({ ...item, currency: value ?? "VND" })} />
          </Group>
          <TextInput type="url" label={t("fields.imageUrl")} value={item.imageUrl ?? ""} onChange={(event) => setItem({ ...item, imageUrl: event.currentTarget.value })} />
          <Switch label={t("fields.available")} checked={item.available} onChange={(event) => setItem({ ...item, available: event.currentTarget.checked })} />
          <Button color="warmCoral" loading={pending} disabled={!item.name.trim() || !item.categoryId} onClick={() => void saveItem()}>{t("save")}</Button>
        </Stack>
      </Modal>
    </AdminShell>
  );
}
