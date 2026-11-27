"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Badge, Button, Divider, Group, Modal, Radio, SegmentedControl, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconTicket } from "@tabler/icons-react";
import { BottomNav, MobileShell } from "@/components/layout/customer";
import { PrimaryActionButton, StatusBadge, SurfaceCard } from "@/components/ui";
import { uiColors } from "@/theme";
import {
  couponDiscountAmount,
  couponIneligibleReason,
  type Coupon,
  type CouponStatus,
} from "../domain/coupons";

// shortcut: illustrative demo coupons and booking; replace with the coupon API when issuing/redemption exists.
const demoCoupons: Coupon[] = [
  {
    id: "restaurant100k",
    kind: "restaurant",
    scope: "restaurant",
    status: "available",
    discount: { type: "amount", value: 100_000 },
    restaurantSlug: "anan-saigon",
    restaurantName: "Anan Saigon",
    minSpend: 500_000,
    validUntil: "2026-11-30",
  },
  {
    id: "birthdayDessert",
    kind: "birthday",
    scope: "restaurant",
    status: "available",
    discount: { type: "item" },
    minSpend: 300_000,
    validFrom: "2026-11-25",
    validUntil: "2026-12-01",
  },
  {
    id: "shopFirstOrder",
    kind: "shop",
    scope: "shop",
    status: "available",
    discount: { type: "percent", value: 10, max: 50_000 },
    validUntil: "2026-12-31",
  },
  {
    id: "restaurant50kUsed",
    kind: "restaurant",
    scope: "restaurant",
    status: "used",
    discount: { type: "amount", value: 50_000 },
    restaurantSlug: "anan-saigon",
    restaurantName: "Anan Saigon",
    minSpend: 300_000,
    validUntil: "2026-11-15",
  },
  {
    id: "shopAutumnExpired",
    kind: "shop",
    scope: "shop",
    status: "expired",
    discount: { type: "percent", value: 15, max: 100_000 },
    validUntil: "2026-10-31",
  },
];

const demoBooking = {
  restaurantSlug: "anan-saigon",
  restaurantName: "Anan Saigon",
  date: "2026-11-28T19:30:00",
  guests: 2,
  menu: [{ name: "Dim sum set", quantity: 2, price: 350_000 }],
};

function useCouponFormat() {
  const t = useTranslations("Coupons");
  const locale = useLocale();
  const money = (value: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));

  return {
    t,
    money,
    title: (coupon: Coupon) => t(`items.${coupon.id}` as "items.restaurant100k"),
    where: (coupon: Coupon) =>
      coupon.scope === "shop" ? t("scope.shop") : coupon.restaurantName ?? t("scope.dineIn"),
    condition: (coupon: Coupon) =>
      coupon.minSpend
        ? t("condition.minSpend", { amount: money(coupon.minSpend) })
        : coupon.discount.type === "percent" && coupon.discount.max
          ? t("condition.maxDiscount", { amount: money(coupon.discount.max) })
          : null,
    validity: (coupon: Coupon) =>
      coupon.validFrom
        ? t("validRange", { from: date(coupon.validFrom), until: date(coupon.validUntil) })
        : t("validUntil", { date: date(coupon.validUntil) }),
  };
}

export function CouponWalletScreen() {
  const f = useCouponFormat();
  const { t } = f;
  const [status, setStatus] = useState<CouponStatus>("available");
  const [details, setDetails] = useState<Coupon | null>(null);
  const count = (value: CouponStatus) => demoCoupons.filter((coupon) => coupon.status === value).length;
  const visible = demoCoupons.filter((coupon) => coupon.status === status);

  return (
    <MobileShell title={t("wallet.title")} backHref="/my" bottomNav={<BottomNav activePath="/my" />}>
      <Title order={2}>{t("wallet.heading")}</Title>
      <SegmentedControl
        fullWidth
        color="warmCoral"
        value={status}
        onChange={(value) => setStatus(value as CouponStatus)}
        data={[
          { value: "available", label: t("wallet.available", { count: count("available") }) },
          { value: "used", label: t("wallet.used") },
          { value: "expired", label: t("wallet.expired") },
        ]}
      />

      {visible.length === 0 ? (
        <Text ta="center" c={uiColors.textSecondary}>{t("wallet.empty")}</Text>
      ) : (
        visible.map((coupon) => {
          const condition = f.condition(coupon);
          return (
            <SurfaceCard key={coupon.id} p="md" style={{ opacity: coupon.status === "available" ? 1 : 0.6 }}>
              <Stack gap={6}>
                <Group justify="space-between">
                  <Badge variant="light" color={coupon.kind === "shop" ? "teal" : "warmCoral"}>
                    {t(`kind.${coupon.kind}`)}
                  </Badge>
                  {coupon.status !== "available" ? (
                    <StatusBadge>{t(`wallet.${coupon.status}`)}</StatusBadge>
                  ) : null}
                </Group>
                <Title order={3}>{f.title(coupon)}</Title>
                <Text size="sm">{f.where(coupon)}</Text>
                {condition ? <Text size="sm" c={uiColors.textSecondary}>{condition}</Text> : null}
                <Group justify="space-between" align="center">
                  <Text size="xs" c={uiColors.textMuted}>{f.validity(coupon)}</Text>
                  <Button variant="subtle" size="compact-sm" onClick={() => setDetails(coupon)}>
                    {t("viewDetails")}
                  </Button>
                </Group>
              </Stack>
            </SurfaceCard>
          );
        })
      )}

      <Modal opened={details !== null} onClose={() => setDetails(null)} title={details ? f.title(details) : ""} centered>
        {details ? (
          <Stack gap="sm">
            <Text size="sm">{f.where(details)}</Text>
            {f.condition(details) ? <Text size="sm">{f.condition(details)}</Text> : null}
            <Text size="sm">{f.validity(details)}</Text>
            <Text size="sm" c={uiColors.textSecondary}>
              {details.scope === "shop" ? t("howToUse.shop") : t("howToUse.restaurant")}
            </Text>
            {details.scope === "restaurant" && details.status === "available" ? (
              <Button component={Link} href="/my/coupons/apply" color="warmCoral">
                {t("useForBooking")}
              </Button>
            ) : null}
          </Stack>
        ) : null}
      </Modal>
    </MobileShell>
  );
}

export function ApplyCouponScreen() {
  const f = useCouponFormat();
  const { t, money } = f;
  const locale = useLocale();
  const subtotal = demoBooking.menu.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const booking = { restaurantSlug: demoBooking.restaurantSlug, subtotal };
  const options = demoCoupons.filter((coupon) => coupon.status === "available");
  const [selectedId, setSelectedId] = useState<string | null>(
    options.find((coupon) => couponIneligibleReason(coupon, booking) === null)?.id ?? null,
  );
  const selected = options.find((coupon) => coupon.id === selectedId) ?? null;
  const discount = selected ? couponDiscountAmount(selected, subtotal) : 0;
  const bookingDate = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(demoBooking.date));

  return (
    <MobileShell title={t("apply.title")} backHref="/my/coupons" bottomNav={<BottomNav activePath="/reservations" />}>
      <SurfaceCard p="md">
        <Stack gap={4}>
          <Title order={3}>{demoBooking.restaurantName}</Title>
          <Text size="sm" c={uiColors.textSecondary}>
            {bookingDate} · {t("apply.guests", { count: demoBooking.guests })}
          </Text>
        </Stack>
      </SurfaceCard>

      <SurfaceCard p="md">
        <Group justify="space-between">
          <Text fw={700}>{t("apply.selectedMenu")}</Text>
          <Text fw={800}>{money(subtotal)}</Text>
        </Group>
        {demoBooking.menu.map((item) => (
          <Text key={item.name} size="sm" c={uiColors.textSecondary}>
            {item.name} × {item.quantity}
          </Text>
        ))}
      </SurfaceCard>

      <Radio.Group value={selectedId} onChange={setSelectedId} aria-label={t("apply.title")}>
        <Stack gap="sm">
          {options.map((coupon) => {
            const reason = couponIneligibleReason(coupon, booking);
            const condition = f.condition(coupon);
            return (
              <Radio.Card key={coupon.id} value={coupon.id} disabled={reason !== null} radius="lg" p="md"
                style={{ opacity: reason ? 0.55 : 1 }}>
                <Group wrap="nowrap" align="flex-start">
                  <Radio.Indicator />
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Text fw={800}>{f.title(coupon)}</Text>
                    <Text size="sm" c={uiColors.textSecondary}>
                      {[f.where(coupon), condition].filter(Boolean).join(" · ")}
                    </Text>
                    {reason ? (
                      <Text size="xs" c={uiColors.textMuted}>{t(`apply.reason.${reason}`)}</Text>
                    ) : (
                      <StatusBadge tone="success" style={{ alignSelf: "flex-start" }}>{t("apply.eligible")}</StatusBadge>
                    )}
                  </Stack>
                </Group>
              </Radio.Card>
            );
          })}
        </Stack>
      </Radio.Group>

      <SurfaceCard p="md">
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm">{t("apply.subtotal")}</Text>
            <Text size="sm">{money(subtotal)}</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm">{t("apply.discount")}</Text>
            <Text size="sm" c={uiColors.brandPrimary}>
              {selected?.discount.type === "item" ? t("apply.freeItem") : "- " + money(discount)}
            </Text>
          </Group>
          <Divider />
          <Group justify="space-between">
            <Text fw={800}>{t("apply.payAtRestaurant")}</Text>
            <Text fw={800}>{money(subtotal - discount)}</Text>
          </Group>
        </Stack>
      </SurfaceCard>

      <Group gap={6} wrap="nowrap" align="flex-start">
        <IconTicket size={16} color={uiColors.textMuted} />
        <Text size="xs" c={uiColors.textMuted}>{t("apply.note")}</Text>
      </Group>

      <PrimaryActionButton
        color="warmCoral"
        size="lg"
        disabled={!selected}
        onClick={() => notifications.show({ message: t("apply.applied"), color: "teal" })}
      >
        {t("apply.submit")}
      </PrimaryActionButton>
    </MobileShell>
  );
}
