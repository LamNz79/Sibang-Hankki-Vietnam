"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import type { RestaurantRecord } from "@/features/restaurants/data/mock-data";
import { submitReservationRequest } from "@/features/reservations/data/reservation-storage";
import type { CustomerReservation } from "@/features/reservations/types";

type UseReservationBookingOptions = {
  restaurant: RestaurantRecord;
  changeReservationId?: string | null;
};

/** Maps an exact party size to the prototype's available capacity buckets. */
export function getGuestCapacity(guests: number) {
  if (guests <= 2) return "2";
  if (guests <= 4) return "4";
  return "6";
}

/** Finds the earliest bookable date containing at least one available slot. */
function getFirstAvailableDate(
  slotMatrix: RestaurantRecord["slotMatrix"],
  bookingStartDate: string,
) {
  return (
    Object.entries(slotMatrix)
      .filter(([date]) => date >= bookingStartDate)
      .sort(([firstDate], [secondDate]) =>
        firstDate.localeCompare(secondDate),
      )
      .find(([, guests]) =>
        Object.values(guests).some((slots) => slots.length > 0),
      )?.[0] ?? bookingStartDate
  );
}

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
  const defaultDate = useMemo(
    () =>
      getFirstAvailableDate(
        restaurant.slotMatrix,
        bookingStartDate.format("YYYY-MM-DD"),
      ),
    [bookingStartDate, restaurant.slotMatrix],
  );

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
  const availableTimes = useMemo(() => {
    const matrix = restaurant.slotMatrix[selectedDateIso];
    return matrix?.[getGuestCapacity(selectedGuests)] ?? [];
  }, [restaurant.slotMatrix, selectedDateIso, selectedGuests]);

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
    if (!selectedDate || !selectedTime) return;

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
    submittedReservation,
    successOpened,
    closeSuccess: () => setSuccessOpened(false),
    submit,
  };
}
