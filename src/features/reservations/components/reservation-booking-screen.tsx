"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Stack, Text, TextInput } from "@mantine/core";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("restaurant") ?? "royal-pavilion";
  const changeReservationId = searchParams.get("change");
  const restaurant = getRestaurantBySlug(slug) ?? restaurantRecords[0];
  const booking = useReservationBooking({
    restaurant,
    changeReservationId,
  });

  return (
    <MobileShell
      title="Book a table"
      subtitle="Table booking"
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
              ? "Request this time"
              : "Request reservation"
            : "Select an available time"}
        </Button>
      }
    >
      <BookingRestaurantSummary restaurant={restaurant} />

      <BookingDateSelector
        value={booking.selectedDate}
        label={booking.selectedDateLabel}
        minDate={booking.bookingStartDate}
        maxDate={booking.bookingEndDate}
        onChange={booking.selectDate}
      />

      <BookingGuestSelector
        value={booking.selectedGuests}
        onChange={booking.selectGuests}
      />

      <Stack gap="sm">
        <Text fw={700}>Contact information</Text>
        <TextInput
          label="Full name"
          value={booking.customerName}
          onChange={(event) => booking.setCustomerName(event.currentTarget.value)}
          autoComplete="name"
          maxLength={120}
          required
        />
        <TextInput
          label="Phone number"
          type="tel"
          value={booking.customerPhone}
          onChange={(event) => booking.setCustomerPhone(event.currentTarget.value)}
          autoComplete="tel"
          maxLength={30}
          required
        />
        <TextInput
          label="Email (optional)"
          type="email"
          value={booking.customerEmail}
          onChange={(event) => booking.setCustomerEmail(event.currentTarget.value)}
          autoComplete="email"
          maxLength={320}
          error={booking.customerEmailError}
        />
      </Stack>

      {booking.changeReservationUnsupported ? (
        <Alert color="yellow" title="Changing reservations is not available yet">
          Please create a new reservation or return to your existing booking.
        </Alert>
      ) : null}

      {booking.submissionError ? (
        <Alert color="red" title="Unable to send reservation" role="alert">
          {booking.submissionError}
        </Alert>
      ) : null}

      {booking.availabilityLoading ? <Text role="status">Checking available times...</Text> :
      booking.availabilityError ? (
        <Alert color="red" title="Unable to check availability" role="alert">
          <Text size="sm">{booking.availabilityError}</Text>
          <Button variant="light" color="red" onClick={booking.retryAvailability}>Try again</Button>
        </Alert>
      ) : booking.requiresRestaurantConfirmation ? (
        <Alert color="yellow" title="Restaurant confirmation required">
          Contact the restaurant to arrange a time for your group. No online times are offered for this party size.
        </Alert>
      ) : <BookingTimeSelector
        times={booking.availableTimes}
        value={booking.selectedTime}
        onChange={booking.selectTime}
      />}

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
  return (
    <Suspense
      fallback={
        <MobileShell
          title="Book a table"
          subtitle="Loading booking details..."
          bottomNav={null}
        >
          <Text>Loading...</Text>
        </MobileShell>
      }
    >
      <ReservationBookingContent />
    </Suspense>
  );
}
