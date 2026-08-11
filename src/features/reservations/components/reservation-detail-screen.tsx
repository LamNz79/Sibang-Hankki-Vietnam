"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import dayjs from "dayjs";
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconCalendarClock,
  IconCalendarEvent,
  IconCheck,
  IconChevronRight,
  IconClock,
  IconCopy,
  IconMessage,
  IconQrcode,
  IconToolsKitchen3,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { BottomNav, MobileShell } from "@/components/layout/customer";
import { StatusBadge } from "@/components/ui";
import {
  getReservationReference,
  getReservationStatusFlags,
} from "@/features/reservations/domain/selectors";
import { useCustomerReservation } from "@/features/reservations/hooks/use-customer-reservations";
import type { CustomerReservation } from "@/features/reservations/types";
import { getRestaurantBySlug } from "@/features/restaurants/data/mock-data";
import { CustomerAlternativeProposalCard } from "./customer-alternative-proposal-card";
import { uiColors } from "@/theme";

/** Content and color configuration for one reservation information row. */
type DetailRowProps = {
  icon: typeof IconCalendarEvent;
  label: string;
  value: string;
  iconBackground: string;
  iconColor: string;
};

/** Renders one labeled reservation detail with a semantic icon treatment. */
function DetailRow({
  icon: Icon,
  label,
  value,
  iconBackground,
  iconColor,
}: DetailRowProps) {
  return (
    <Group gap="sm" wrap="nowrap" py="sm">
      <ThemeIcon
        size={34}
        radius="md"
        variant="filled"
        style={{
          flexShrink: 0,
          background: iconBackground,
          color: iconColor,
        }}
      >
        <Icon size={17} />
      </ThemeIcon>
      <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
        <Text size="xs" c={uiColors.textSecondary}>
          {label}
        </Text>
        <Text size="sm" fw={700} c={uiColors.textPrimary}>
          {value}
        </Text>
      </Stack>
    </Group>
  );
}

/** Maps reservation state to the customer-facing status summary. */
function ReservationStatusCard({
  reservation,
}: {
  reservation: CustomerReservation;
}) {
  const { isPending, isAlternative, isDeclined } =
    getReservationStatusFlags(reservation);
  const background = isPending
    ? uiColors.statusWarningSurface
    : isAlternative
      ? uiColors.brandPrimarySubtle
      : isDeclined
        ? uiColors.statusErrorSurface
        : uiColors.statusSuccessSurface;
  const borderColor = isPending
    ? uiColors.statusWarningBorder
    : isAlternative
      ? uiColors.brandPrimary
      : isDeclined
        ? uiColors.statusErrorText
        : uiColors.statusSuccessText;

  return (
    <Card
      radius="lg"
      p="md"
      style={{
        background,
        border: `1px solid ${borderColor}`,
      }}
    >
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon
          size={44}
          radius="xl"
          variant="light"
          color={
            isPending
              ? "sand"
              : isAlternative
                ? "warmCoral"
                : isDeclined
                  ? "red"
                  : "teal"
          }
          style={{ flexShrink: 0 }}
        >
          {isPending ? (
            <IconClock size={22} />
          ) : isAlternative ? (
            <IconCalendarClock size={22} />
          ) : isDeclined ? (
            <IconX size={22} />
          ) : (
            <IconCheck size={22} />
          )}
        </ThemeIcon>
        <Stack gap={2}>
          <StatusBadge
            tone={
              isPending
                ? "warning"
                : isAlternative
                  ? "brand"
                  : isDeclined
                    ? "error"
                    : "success"
            }
            w="fit-content"
          >
            {isPending
              ? "Pending confirmation"
              : isAlternative
                ? "Action required"
                : isDeclined
                  ? "Request declined"
                  : "Reservation confirmed"}
          </StatusBadge>
          <Text fw={800} c={uiColors.textPrimary}>
            {isPending
              ? "Waiting for the restaurant"
              : isAlternative
                ? "The restaurant suggested a new time"
                : isDeclined
                  ? "This request is closed"
                  : "Your table is confirmed"}
          </Text>
          <Text size="xs" c={uiColors.textSecondary}>
            {isPending
              ? "The restaurant will confirm your request or contact you if anything needs to change."
              : isAlternative
                ? "Review the proposed time below. Your table is not confirmed until you accept it."
                : isDeclined
                  ? "The restaurant has been notified that you declined the proposed time."
                  : "Your reservation is ready. Show the booking code when you arrive."}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}

/**
 * Customer reservation detail screen, including status, booking reference,
 * alternative-time response, and restaurant information.
 */
export function ReservationDetailScreen() {
  const params = useParams<{ id: string }>();
  const reservation = useCustomerReservation(params.id);
  const [copied, setCopied] = useState(false);

  if (!reservation) {
    return (
      <MobileShell
        title="Reservation details"
        backHref="/reservations"
        bottomNav={<BottomNav activePath="/reservations" />}
      >
        <Card
          radius="lg"
          p="xl"
          style={{
            border: `1px dashed ${uiColors.borderStrong}`,
            background: uiColors.surfaceAlt,
          }}
        >
          <Stack align="center" gap="sm">
            <Text fw={800} c={uiColors.textPrimary}>
              Reservation not found
            </Text>
            <Text size="sm" ta="center" c={uiColors.textSecondary}>
              This reservation may have been removed or is not available on
              this device.
            </Text>
            <Button component={Link} href="/reservations" color="warmCoral">
              Back to reservations
            </Button>
          </Stack>
        </Card>
      </MobileShell>
    );
  }

  const restaurant = getRestaurantBySlug(reservation.restaurantSlug);
  const reference = getReservationReference(reservation);
  const { isPending, isAlternative, isDeclined } =
    getReservationStatusFlags(reservation);

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <MobileShell
      title="Reservation details"
      backHref="/reservations"
      bottomNav={<BottomNav activePath="/reservations" />}
    >
      <ReservationStatusCard reservation={reservation} />

      {isAlternative ? (
        <CustomerAlternativeProposalCard reservation={reservation} />
      ) : null}

      <Card
        radius="lg"
        p="md"
        style={{
          border: `1px dashed ${uiColors.borderStrong}`,
          background: uiColors.surface,
        }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Stack gap={2}>
            <Text size="xs" c={uiColors.textSecondary}>
              Booking reference
            </Text>
            <Text fw={800} c={uiColors.textPrimary}>
              {reference}
            </Text>
          </Stack>
          <ActionIcon
            variant="light"
            color={copied ? "teal" : "warmCoral"}
            radius="md"
            size="lg"
            aria-label="Copy booking reference"
            onClick={copyReference}
          >
            {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
          </ActionIcon>
        </Group>
      </Card>

      <Card
        component={Link}
        href={`/restaurants/${reservation.restaurantSlug}`}
        radius="lg"
        p="sm"
        style={{
          color: "inherit",
          textDecoration: "none",
          border: `1px solid ${uiColors.border}`,
          background: uiColors.surface,
        }}
      >
        <Group wrap="nowrap">
          <Box
            w={64}
            h={64}
            style={{
              flexShrink: 0,
              borderRadius: 12,
              background: `repeating-linear-gradient(135deg, ${
                restaurant?.heroAccent ?? uiColors.brandPrimarySoft
              } 0 8px, #ffffff 8px 16px)`,
            }}
          />
          <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
            <Text fw={800} c={uiColors.textPrimary}>
              {reservation.restaurantName}
            </Text>
            <Text size="xs" c={uiColors.textSecondary}>
              {reservation.district} · {reservation.cuisineLabel}
            </Text>
          </Stack>
          <IconChevronRight size={18} color={uiColors.textMuted} />
        </Group>
      </Card>

      <Card
        radius="lg"
        px="md"
        py={0}
        style={{
          border: `1px solid ${uiColors.border}`,
          background: uiColors.surface,
        }}
      >
        <DetailRow
          icon={IconCalendarEvent}
          label="Date"
          value={dayjs(reservation.date).format("dddd, MMM D, YYYY")}
          iconBackground={uiColors.detailDateSurface}
          iconColor={uiColors.detailDateText}
        />
        <Divider color={uiColors.border} />
        <DetailRow
          icon={IconUsers}
          label="Time · guests"
          value={`${reservation.time} · ${reservation.guests} guests`}
          iconBackground={uiColors.detailGuestsSurface}
          iconColor={uiColors.detailGuestsText}
        />
        <Divider color={uiColors.border} />
        <DetailRow
          icon={IconToolsKitchen3}
          label="Pre-order"
          value={reservation.preOrder ?? "Not added"}
          iconBackground={uiColors.detailPreOrderSurface}
          iconColor={uiColors.detailPreOrderText}
        />
        <Divider color={uiColors.border} />
        <DetailRow
          icon={IconMessage}
          label="Request"
          value={reservation.specialRequest ?? "No special requests"}
          iconBackground={uiColors.detailRequestSurface}
          iconColor={uiColors.detailRequestText}
        />
      </Card>

      <Card
        radius="lg"
        p="md"
          style={{
            border: `1px solid ${uiColors.border}`,
          background:
            isPending || isAlternative
              ? uiColors.statusInfoSurface
              : uiColors.surfaceAlt,
        }}
      >
        <Group gap="sm" wrap="nowrap" align="flex-start">
          <ThemeIcon
            radius="md"
            size={38}
            variant="light"
            color={
              isPending || isAlternative || isDeclined ? "gray" : "warmCoral"
            }
            style={{ flexShrink: 0 }}
          >
            {isPending || isAlternative || isDeclined ? (
              <IconClock size={19} />
            ) : (
              <IconQrcode size={19} />
            )}
          </ThemeIcon>
          <Stack gap={2}>
            <Text fw={750} size="sm" c={uiColors.textPrimary}>
              {isPending
                ? "Check-in code available after confirmation"
                : isAlternative
                  ? "Respond before this booking can be confirmed"
                  : isDeclined
                    ? "No table is being held"
                    : "Show your reservation when you arrive"}
            </Text>
            <Text size="xs" c={uiColors.textSecondary}>
              {isPending
                ? "The restaurant may contact you before confirming this request."
                : isAlternative
                  ? "Accept the suggested time, choose another time, or decline the request."
                  : isDeclined
                    ? "Make a new request whenever you are ready."
                    : "Staff can confirm your booking code or check you in with the QR code."}
            </Text>
          </Stack>
        </Group>
      </Card>

      {!isAlternative && !isDeclined ? (
        <SimpleGrid cols={2} spacing="sm">
          <Button
            variant="outline"
            color="gray"
            radius="md"
            disabled
            title="Change flow will be added after the policy is confirmed"
          >
            {isPending ? "Change request" : "Change"}
          </Button>
          <Button
            variant="outline"
            color="red"
            radius="md"
            disabled
            title="Cancellation flow will be added after the policy is confirmed"
          >
            {isPending ? "Cancel request" : "Cancel"}
          </Button>
        </SimpleGrid>
      ) : isDeclined ? (
        <Button
          component={Link}
          href={`/reservation?restaurant=${reservation.restaurantSlug}`}
          fullWidth
          color="warmCoral"
        >
          Make a new reservation
        </Button>
      ) : null}
    </MobileShell>
  );
}
