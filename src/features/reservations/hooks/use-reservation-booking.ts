"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import type { RestaurantRecord } from "@/features/restaurants/data/mock-data";
import { submitReservationRequest } from "@/features/reservations/data/reservation-storage";
import type { CustomerReservation } from "@/features/reservations/types";
import { useQuery } from "@tanstack/react-query";
import { getAvailability } from "@/features/reservations/data/availability";

type UseReservationBookingOptions = {
  restaurant: RestaurantRecord;
  changeReservationId?: string | null;
};

/**
 * Owns booking selections and submission while leaving route rendering and
 * post-submit navigation to the booking screen and its child components.
 */
export function useReservationBooking({
  restaurant,
  changeReservationId,
}: UseReservationBookingOptions) {
  const bookingStartDate = useMemo(() => dayjs().startOf("day"), []);
  const bookingEndDate = useMemo(
    () => bookingStartDate.add(60, "day"),
    [bookingStartDate],
  );
  const defaultDate = bookingStartDate.format("YYYY-MM-DD");

  const [selectedDate, setSelectedDate] = useState<string | null>(defaultDate);
  const [selectedGuests, setSelectedGuests] = useState(2);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [submittedReservation, setSubmittedReservation] =
    useState<CustomerReservation | null>(null);
  const [successOpened, setSuccessOpened] = useState(false);

  const selectedDateIso =
    selectedDate ?? bookingStartDate.format("YYYY-MM-DD");
  const selectedDateLabel = selectedDate
    ? dayjs(selectedDate).format("ddd, MMM D, YYYY")
    : "No date selected";
  const availability = useQuery({
    queryKey: ["availability", restaurant.slug, selectedDateIso, selectedGuests],
    queryFn: ({ signal }) => getAvailability(restaurant.slug, selectedDateIso, selectedGuests, signal),
    retry: false,
  });
  const availableTimes = availability.isFetching || availability.isError
    ? [] : availability.data?.slots ?? [];
  const canSubmit = Boolean(selectedTime && availableTimes.includes(selectedTime));

  const selectDate = (date: string | null) => {
    if (!date) return;

    const nextDate = dayjs(date);
    if (
      nextDate.isBefore(bookingStartDate, "day") ||
      nextDate.isAfter(bookingEndDate, "day")
    ) {
      return;
    }

    setSelectedDate(date);
    setSelectedTime(null);
  };

  const selectGuests = (guests: number) => {
    setSelectedGuests(guests);
    setSelectedTime(null);
  };

  const submit = () => {
    if (!selectedDate || !selectedTime || !canSubmit) return;

    const reservation = submitReservationRequest({
      restaurantSlug: restaurant.slug,
      restaurantName: restaurant.name,
      district: restaurant.district,
      cuisineLabel: restaurant.cuisineLabel,
      date: selectedDate,
      time: selectedTime,
      guests: selectedGuests,
      changeReservationId,
    });

    setSubmittedReservation(reservation);
    setSuccessOpened(true);
  };

  return {
    bookingStartDate: bookingStartDate.format("YYYY-MM-DD"),
    bookingEndDate: bookingEndDate.format("YYYY-MM-DD"),
    selectedDate,
    selectedDateLabel,
    selectDate,
    selectedGuests,
    selectGuests,
    selectedTime,
    selectTime: setSelectedTime,
    availableTimes,
    canSubmit,
    availabilityLoading: availability.isPending || availability.isFetching,
    availabilityError: availability.error?.message,
    retryAvailability: () => void availability.refetch(),
    requiresRestaurantConfirmation: availability.data?.requiresRestaurantConfirmation ?? false,
    submittedReservation,
    successOpened,
    closeSuccess: () => setSuccessOpened(false),
    submit,
  };
}
