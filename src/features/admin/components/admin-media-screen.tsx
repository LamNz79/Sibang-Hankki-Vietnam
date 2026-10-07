"use client";

import { useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Image,
  Loader,
  Modal,
  NumberInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertCircle, IconEdit, IconPhoto, IconPlus, IconTrash } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/features/admin/components/admin-shell";
import type { RestaurantImage } from "@/features/admin/data/owner-media";
import { useOwnerMedia } from "@/features/admin/hooks/use-owner-media";
import { uiColors } from "@/theme";

const emptyImage = { id: "", imageUrl: "", altText: "", sortOrder: 0 };

export function AdminMediaScreen() {
  const t = useTranslations("Admin.media");
  const { query, mutations, error } = useOwnerMedia();
  const [opened, modal] = useDisclosure(false);
  const [draft, setDraft] = useState(emptyImage);
  const images = query.data?.images ?? [];
  const pending = Object.values(mutations).some((mutation) => mutation.isPending);

  const openEditor = (image?: RestaurantImage) => {
    setDraft(image
      ? { ...image, altText: image.altText ?? "" }
      : { ...emptyImage, sortOrder: Math.max(-1, ...images.map(({ sortOrder }) => sortOrder)) + 1 });
    modal.open();
  };
  const save = async () => {
    const input = { ...draft, altText: draft.altText.trim() || null };
    try {
      if (draft.id) await mutations.update.mutateAsync(input);
      else await mutations.create.mutateAsync(input);
      modal.close();
    } catch {
      // The mutation exposes the localized error alert above.
    }
  };
  const remove = (id: string) => {
    if (window.confirm(t("deleteConfirm"))) mutations.delete.mutate(id);
  };

  return (
    <AdminShell>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Stack gap={3}>
            <Title order={1}>{t("title")}</Title>
            <Text c={uiColors.textSecondary}>{t("description")}</Text>
          </Stack>
          <Button color="warmCoral" leftSection={<IconPlus size={16} />} onClick={() => openEditor()}>
            {t("add")}
          </Button>
        </Group>

        <Alert color="blue" icon={<IconPhoto size={18} />}>{t("primaryHint")}</Alert>
        {error ? <Alert color="red" icon={<IconAlertCircle size={18} />}>{t("error")}</Alert> : null}
        {query.isLoading ? <Loader color="warmCoral" /> : null}

        <SimpleGrid cols={{ base: 1, sm: 2, xl: 3 }}>
          {images.map((image, index) => (
            <Card key={image.id} withBorder radius="sm" p={0}>
              <Card.Section>
                <Image src={image.imageUrl} alt={image.altText ?? ""} h={190} fit="cover" />
              </Card.Section>
              <Stack p="md" gap="sm">
                <Group justify="space-between">
                  {index === 0 ? <Badge color="warmCoral">{t("primary")}</Badge> : <span />}
                  <Text size="xs" c={uiColors.textSecondary}>{t("sortOrder", { order: image.sortOrder })}</Text>
                </Group>
                <Text size="sm" lineClamp={2}>{image.altText || t("noAltText")}</Text>
                <Group justify="flex-end" gap="xs">
                  <ActionIcon variant="subtle" aria-label={t("edit")} onClick={() => openEditor(image)}>
                    <IconEdit size={17} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" aria-label={t("delete")} onClick={() => remove(image.id)}>
                    <IconTrash size={17} />
                  </ActionIcon>
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>

        {!query.isLoading && images.length === 0 ? (
          <Card withBorder p="xl"><Text ta="center" c={uiColors.textSecondary}>{t("empty")}</Text></Card>
        ) : null}
      </Stack>

      <Modal opened={opened} onClose={modal.close} title={t(draft.id ? "edit" : "add")}>
        <Stack>
          <TextInput required type="url" label={t("fields.imageUrl")} value={draft.imageUrl} onChange={(event) => setDraft({ ...draft, imageUrl: event.currentTarget.value })} />
          <TextInput label={t("fields.altText")} maxLength={300} value={draft.altText} onChange={(event) => setDraft({ ...draft, altText: event.currentTarget.value })} />
          <NumberInput label={t("fields.sortOrder")} min={0} value={draft.sortOrder} onChange={(value) => setDraft({ ...draft, sortOrder: Number(value) || 0 })} />
          <Button color="warmCoral" loading={pending} disabled={!draft.imageUrl.trim()} onClick={() => void save()}>
            {t("save")}
          </Button>
        </Stack>
      </Modal>
    </AdminShell>
  );
}
