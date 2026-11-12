"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ActionIcon, Alert, Badge, Box, Button, Card, Checkbox, Divider, Group, Image, Modal, NumberInput, Select, SimpleGrid, Stack, Text, TextInput, Title, UnstyledButton } from "@mantine/core";
import { IconArrowLeft, IconCheck, IconHeart, IconPlus, IconSearch, IconShoppingBag, IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { BottomNav, MobileShell } from "@/components/layout/customer";
import { cartTotals, products, type Cart, type Product } from "./catalog";

const categories = ["all", "beauty", "food", "drinks", "gifts"] as const;
type View = "shop" | "bag" | "checkout" | "complete";

export function ShopScreen() {
  const t = useTranslations("Shop");
  const locale = useLocale();
  const money = (value: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
  // shortcut: demo state lasts only while this screen is mounted; use account-backed persistence for the real shop.
  const [view, setView] = useState<View>("shop");
  const [cart, setCart] = useState<Cart>({});
  const [saved, setSaved] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<string | null>("featured");
  const [selected, setSelected] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const count = Object.values(cart).reduce((sum, value) => sum + value, 0);
  const totals = cartTotals(cart);
  const visible = products.filter(product =>
    (category === "all" || category === product.category) &&
    (!savedOnly || saved.includes(product.id)) &&
    `${product.name} ${product.brand}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  ).sort((a, b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : sort === "name" ? a.name.localeCompare(b.name, locale) : 0);

  function toggleSaved(id: string) {
    setSaved(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
  }
  function add(product: Product, amount = 1) {
    setCart(current => ({ ...current, [product.id]: Math.min(99, (current[product.id] ?? 0) + amount) }));
    setSelected(null);
    notifications.show({ message: t("added"), color: "teal" });
  }
  function updateQuantity(id: string, value: string | number) {
    setCart(current => ({ ...current, [id]: Math.max(1, Math.min(99, Math.floor(Number(value) || 1))) }));
  }
  function remove(id: string) {
    setCart(current => { const next = { ...current }; delete next[id]; return next; });
  }
  function summary() {
    return <Card withBorder radius="lg" p="lg">
      <Stack gap="sm">
        <Title order={3} size="h4">{t("summary")}</Title>
        <Group justify="space-between"><Text>{t("subtotal", { count })}</Text><Text fw={600}>{money(totals.subtotal)}</Text></Group>
        <Group justify="space-between"><Text>{t("delivery")}</Text><Text fw={600}>{money(totals.delivery)}</Text></Group>
        <Divider />
        <Group justify="space-between"><Text fw={700}>{t("total")}</Text><Text fw={800} size="xl">{money(totals.total)}</Text></Group>
        <Text size="xs" c="dimmed">{t("freeDelivery", { amount: money(500000) })}</Text>
        {view === "bag" && <Button color="warmCoral" onClick={() => setView("checkout")}>{t("checkout")}</Button>}
        <Text size="xs" c="dimmed">{t("noCharge")}</Text>
      </Stack>
    </Card>;
  }

  return <MobileShell title="Sibang Hankki" bottomNav={<BottomNav activePath="/shop" />} headerAction={
    <Box pos="relative">
      <ActionIcon variant="light" color="warmCoral" radius="xl" size="lg" aria-label={t("bag")} onClick={() => setView("bag")}><IconShoppingBag size={21} /></ActionIcon>
      {count > 0 && <Badge pos="absolute" top={-7} right={-7} size="xs" color="warmCoral" style={{ pointerEvents: "none" }}>{count}</Badge>}
    </Box>
  }>
    <Alert color="yellow" radius="md" py="xs"><Text size="xs" fw={600}>{t("preview")}</Text></Alert>
    <Group justify="space-between">
      <Group gap="xs">
        {view !== "shop" && <ActionIcon variant="subtle" aria-label={t("back")} onClick={() => setView(view === "checkout" ? "bag" : "shop")}><IconArrowLeft size={20} /></ActionIcon>}
        <Title order={1} size="h2">{t(view === "shop" ? "title" : view === "bag" ? "bag" : view === "checkout" ? "checkout" : "complete")}</Title>
      </Group>
      {view === "shop" && <ActionIcon aria-label={t("saved")} aria-pressed={savedOnly} variant={savedOnly ? "filled" : "light"} color="warmCoral" radius="xl" onClick={() => setSavedOnly(value => !value)}><IconHeart size={20} /></ActionIcon>}
    </Group>

    {view === "shop" && <>
      <TextInput aria-label={t("search")} placeholder={t("search")} leftSection={<IconSearch size={18} />} value={query} onChange={event => setQuery(event.currentTarget.value)} radius="xl" size="md" />
      <Group gap={6} wrap="nowrap" style={{ overflowX: "auto", paddingBottom: 4 }} aria-label={t("title")}>
        {categories.map(value => <Button key={value} size="xs" radius="xl" style={{ flexShrink: 0 }} color="warmCoral" variant={category === value ? "filled" : "light"} aria-pressed={category === value} onClick={() => setCategory(value)}>{t(`categories.${value}`)}</Button>)}
      </Group>
      <Group justify="space-between" wrap="nowrap">
        <Text size="sm" c="dimmed">{t("count", { count: visible.length })}</Text>
        <Select w={180} size="xs" aria-label={t("sort")} value={sort} allowDeselect={false} onChange={setSort} data={["featured", "low", "high", "name"].map(value => ({ value, label: t(`sorting.${value}`) }))} />
      </Group>
      {visible.length === 0 && <Text ta="center" py="xl" c="dimmed">{t("noProducts")}</Text>}
      <SimpleGrid cols={2} spacing="sm" verticalSpacing="md">
        {visible.map(product => <Card component="article" key={product.id} withBorder radius="lg" p={0} style={{ overflow: "hidden" }}>
          <Box pos="relative">
            <UnstyledButton w="100%" aria-label={t("view", { name: product.name })} onClick={() => { setSelected(product); setQuantity(1); }}>
              <Image src={`/images/shop/${product.image}`} alt={product.name} h={170} fit="cover" />
            </UnstyledButton>
            <Badge size="xs" color="dark" variant="filled" pos="absolute" top={8} left={8}>{product.badge}</Badge>
            <ActionIcon pos="absolute" right={7} bottom={9} radius="xl" color="warmCoral" variant={saved.includes(product.id) ? "filled" : "white"} aria-label={t("save", { name: product.name })} aria-pressed={saved.includes(product.id)} onClick={() => toggleSaved(product.id)}><IconHeart size={16} /></ActionIcon>
          </Box>
          <Stack gap={5} p="sm" style={{ flex: 1 }}>
            <Text size="xs" c="dimmed">{product.brand}</Text>
            <UnstyledButton onClick={() => { setSelected(product); setQuantity(1); }}><Title order={3} size="sm" lineClamp={2}>{product.name}</Title></UnstyledButton>
            <Text size="xs" c="dimmed">{product.contents}</Text>
            <Group justify="space-between" gap={4} mt="auto" pt={6} wrap="nowrap"><Text fw={700} size="sm">{money(product.price)}</Text><ActionIcon color="warmCoral" radius="xl" variant="light" aria-label={t("addProduct", { name: product.name })} onClick={() => add(product)}><IconPlus size={17} /></ActionIcon></Group>
          </Stack>
        </Card>)}
      </SimpleGrid>
      <Text size="xs" c="dimmed" ta="center">{t("sample")}</Text>
    </>}

    {(view === "bag" || view === "checkout") && (count === 0 ? <Stack align="center" py="xl"><IconShoppingBag size={44} /><Text>{t("empty")}</Text><Button color="warmCoral" onClick={() => setView("shop")}>{t("continue")}</Button></Stack> : <>
      {view === "bag" ? products.filter(product => cart[product.id]).map(product => <Card key={product.id} withBorder radius="lg" p="sm">
        <Group wrap="nowrap" align="start">
          <Image src={`/images/shop/${product.image}`} alt={product.name} w={76} h={90} radius="md" />
          <Stack gap={5} style={{ flex: 1, minWidth: 0 }}>
            <Text size="xs" c="dimmed">{product.brand}</Text><Text fw={700} size="sm">{product.name}</Text><Text size="sm">{money(product.price)}</Text>
            <NumberInput aria-label={t("quantity")} min={1} max={99} allowDecimal={false} value={cart[product.id]} onChange={value => updateQuantity(product.id, value)} w={95} size="xs" />
          </Stack>
          <ActionIcon color="gray" variant="subtle" aria-label={t("remove", { name: product.name })} onClick={() => remove(product.id)}><IconTrash size={17} /></ActionIcon>
        </Group>
      </Card>) : <form id="shop-checkout" onSubmit={event => { event.preventDefault(); setCart({}); setView("complete"); }}>
        <Stack>
          <Title order={2} size="h4">{t("details")}</Title><Text size="sm" c="dimmed">{t("sampleDetails")}</Text>
          <TextInput label={t("fullName")} name="demo-name" required maxLength={100} autoComplete="off" />
          <TextInput label={t("phone")} name="demo-phone" type="tel" required maxLength={30} autoComplete="off" />
          <TextInput label={t("address")} name="demo-address" required maxLength={300} autoComplete="off" />
          <Select label={t("note")} defaultValue="hand" allowDeselect={false} data={[{ value: "hand", label: t("hand") }, { value: "door", label: t("door") }]} />
          <Alert color="blue" title={t("payment")}>{t("demoPayment")}</Alert>
          <Checkbox required label={t("acknowledge")} />
        </Stack>
      </form>}
      {summary()}
      {view === "checkout" && <Button color="warmCoral" type="submit" form="shop-checkout">{t("placeDemo")}</Button>}
    </>)}

    {view === "complete" && <Stack align="center" ta="center" py="xl">
      <IconCheck size={64} color="teal" /><Title order={2}>{t("success")}</Title><Text c="dimmed">{t("successDescription")}</Text><Button color="warmCoral" onClick={() => setView("shop")}>{t("continue")}</Button>
    </Stack>}

    <Modal opened={selected !== null} onClose={() => setSelected(null)} title={selected?.name} centered radius="lg" size="sm">
      {selected && <Stack>
        <Image src={`/images/shop/${selected.image}`} alt={selected.name} h={260} radius="md" />
        <Text size="sm" c="dimmed">{selected.brand}</Text><Title order={2} size="h3">{selected.name}</Title><Text fw={800} size="xl">{money(selected.price)}</Text>
        <Text>{selected.contents}</Text><Text size="sm" c="dimmed">{t("deliveryEstimate")}</Text><Text size="xs" c="dimmed">{t("sample")}</Text>
        <NumberInput label={t("quantity")} min={1} max={99} allowDecimal={false} value={quantity} onChange={value => setQuantity(Math.max(1, Math.min(99, Math.floor(Number(value) || 1))))} />
        <Button color="warmCoral" leftSection={<IconShoppingBag size={18} />} onClick={() => add(selected, quantity)}>{t("add")} · {money(selected.price * quantity)}</Button>
      </Stack>}
    </Modal>
  </MobileShell>;
}
