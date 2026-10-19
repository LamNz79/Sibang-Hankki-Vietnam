"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { Alert, Button, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { MobileShell } from "@/components/layout/customer";
import { BookingDateSelector } from "@/features/reservations/components/booking-date-selector";
import { BookingGuestSelector } from "@/features/reservations/components/booking-guest-selector";
import { BookingRestaurantSummary } from "@/features/reservations/components/booking-restaurant-summary";
import { BookingTimeSelector } from "@/features/reservations/components/booking-time-selector";
import { ReservationRequestSuccessModal } from "@/features/reservations/components/reservation-request-success-modal";
import {
  getRestaurantBySlug,
  restaurantRecords,
} from "@/features/restaurants/data/mock-data";
import { useReservationBooking } from "@/features/reservations/hooks/use-reservation-booking";

/** Composes booking controls after Next.js URL search parameters are available. */
function ReservationBookingContent() {
  const format = useFormatter();
  const t = useTranslations("CustomerBooking");
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("restaurant") ?? "royal-pavilion";
  const changeReservationId = searchParams.get("change");
  const restaurant = getRestaurantBySlug(slug) ?? restaurantRecords[0];
  const booking = useReservationBooking({
    restaurant,
    changeReservationId,
  });
  const selectedDateLabel = booking.selectedDate
    ? format.dateTime(new Date(`${booking.selectedDate}T00:00:00`), {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : t("date.none");

  return (
    <MobileShell
      title={t("title")}
      subtitle={t("subtitle")}
      backHref={`/restaurants/${restaurant.slug}`}
      bottomNav={null}
      footerContent={
        <Button
          fullWidth
          radius="md"
          size="lg"
          color="warmCoral"
          disabled={!booking.canSubmit}
          onClick={booking.submit}
          loading={booking.submissionPending}
        >
          {booking.selectedTime
            ? changeReservationId
              ? t("submit.change")
              : t("submit.reservation")
            : t("submit.selectTime")}
        </Button>
      }
    >
      <BookingRestaurantSummary restaurant={restaurant} />

      <BookingDateSelector
        value={booking.selectedDate}
        label={selectedDateLabel}
        minDate={booking.bookingStartDate}
        maxDate={booking.bookingEndDate}
        onChange={booking.selectDate}
      />

      {changeReservationId ? (
        <Stack gap="sm">
          <Alert color="blue" title={t("change.title")}>
            {t("change.description", { count: booking.selectedGuests })}
          </Alert>
          <Textarea
            label={t("change.messageLabel")}
            placeholder={t("change.messagePlaceholder")}
            value={booking.changeMessage}
            onChange={(event) => booking.setChangeMessage(event.currentTarget.value)}
            maxLength={1000}
            autosize
            minRows={2}
          />
        </Stack>
      ) : (
        <>
          <BookingGuestSelector
            value={booking.selectedGuests}
            onChange={booking.selectGuests}
          />

          <Stack gap="sm">
            <Text fw={700}>{t("contact.title")}</Text>
            <TextInput
              label={t("contact.name")}
              value={booking.customerName}
              onChange={(event) => booking.setCustomerName(event.currentTarget.value)}
              autoComplete="name"
              maxLength={120}
              required
            />
            <TextInput
              label={t("contact.phone")}
              type="tel"
              value={booking.customerPhone}
              onChange={(event) => booking.setCustomerPhone(event.currentTarget.value)}
              autoComplete="tel"
              maxLength={30}
              required
            />
            <TextInput
              label={t("contact.email")}
              type="email"
              value={booking.customerEmail}
              onChange={(event) => booking.setCustomerEmail(event.currentTarget.value)}
              autoComplete="email"
              maxLength={320}
              error={booking.customerEmailInvalid ? t("contact.invalidEmail") : undefined}
            />
          </Stack>
        </>
      )}

      {booking.changeReservationUnavailable ? (
        <Alert color="red" title={t("errors.changeTitle")}>
          {t("errors.changeDescription")}
        </Alert>
      ) : null}

      {booking.submissionError ? (
        <Alert color="red" title={t("errors.submissionTitle")} role="alert">
          {t("errors.submissionDescription")}
        </Alert>
      ) : null}

      {booking.availabilityLoading ? <Text role="status">{t("availability.loading")}</Text> :
      booking.availabilityError ? (
        <Alert color="red" title={t("availability.errorTitle")} role="alert">
          <Text size="sm">{t("availability.errorDescription")}</Text>
          <Button variant="light" color="red" onClick={booking.retryAvailability}>{t("availability.retry")}</Button>
        </Alert>
      ) : (
        <Stack gap="sm">
          {booking.requiresRestaurantConfirmation && booking.availableTimes.length > 0 ? (
            <Alert color="yellow" title={t("availability.confirmationTitle")}>
              {t("availability.confirmationDescription")}
            </Alert>
          ) : null}
          <BookingTimeSelector
            times={booking.availableTimes}
            value={booking.selectedTime}
            onChange={booking.selectTime}
          />
        </Stack>
      )}

      <ReservationRequestSuccessModal
        opened={booking.successOpened}
        reservation={booking.submittedReservation}
        isChangeRequest={Boolean(changeReservationId)}
        onClose={booking.closeSuccess}
        onViewDetails={(reservation) =>
          router.push(`/reservations/${reservation.id}`)
        }
        onExploreRestaurants={() => router.push("/restaurants")}
      />
    </MobileShell>
  );
}

/** Booking route screen with a Suspense boundary for URL search parameters. */
export function ReservationBookingScreen() {
  const t = useTranslations("CustomerBooking");

  return (
    <Suspense
      fallback={
        <MobileShell
          title={t("title")}
          subtitle={t("loadingDetails")}
          bottomNav={null}
        >
          <Text>{t("loading")}</Text>
        </MobileShell>
      }
    >
      <ReservationBookingContent />
    </Suspense>
  );
}
