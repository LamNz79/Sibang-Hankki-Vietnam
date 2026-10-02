"use client";

import { useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import type { RestaurantRecord } from "@/features/restaurants/data/mock-data";
import {
  createCheckInToken,
  saveReservation,
} from "@/features/reservations/data/reservation-storage";
import {
  ReservationStatus,
  type CustomerReservation,
} from "@/features/reservations/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAvailability } from "@/features/reservations/data/availability";
import { createReservation } from "@/features/reservations/data/create-reservation";

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
    () => bookingStartDate.add(30, "day"),
    [bookingStartDate],
  );
  const defaultDate = bookingStartDate.format("YYYY-MM-DD");

  const [selectedDate, setSelectedDate] = useState<string | null>(defaultDate);
  const [selectedGuests, setSelectedGuests] = useState(2);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [submittedReservation, setSubmittedReservation] =
    useState<CustomerReservation | null>(null);
  const [successOpened, setSuccessOpened] = useState(false);
  const idempotencyKey = useRef<string | null>(null);

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
  const validEmail = !customerEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail);
  const createMutation = useMutation({
    mutationFn: createReservation,
    onSuccess: (response) => {
      const reservation: CustomerReservation = {
        id: response.id,
        reference: response.reference,
        restaurantSlug: response.restaurantSlug,
        restaurantName: restaurant.name,
        district: restaurant.district,
        cuisineLabel: restaurant.cuisineLabel,
        date: response.date,
        time: response.time,
        guests: response.partySize,
        status:
          response.status === "CONFIRMED"
            ? ReservationStatus.Confirmed
            : ReservationStatus.Pending,
        createdAt: response.createdAt,
        updatedAt: response.createdAt,
      };

      saveReservation(reservation);
      setSubmittedReservation(reservation);
      setSuccessOpened(true);
    },
  });
  const canSubmit = Boolean(
    selectedTime &&
      availableTimes.includes(selectedTime) &&
      customerName.trim() &&
      customerPhone.trim() &&
      validEmail &&
      !changeReservationId &&
      !createMutation.isPending,
  );

  const resetSubmission = () => {
    idempotencyKey.current = null;
    createMutation.reset();
  };

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
    resetSubmission();
  };

  const selectGuests = (guests: number) => {
    setSelectedGuests(guests);
    setSelectedTime(null);
    resetSubmission();
  };

  const selectTime = (time: string | null) => {
    setSelectedTime(time);
    resetSubmission();
  };

  const submit = () => {
    if (!selectedDate || !selectedTime || !canSubmit) return;

    idempotencyKey.current ??= createCheckInToken();
    createMutation.mutate({
      idempotencyKey: idempotencyKey.current,
      restaurantSlug: restaurant.slug,
      date: selectedDate,
      time: selectedTime,
      partySize: selectedGuests,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
    });
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
    selectTime,
    customerName,
    setCustomerName: (value: string) => {
      setCustomerName(value);
      resetSubmission();
    },
    customerPhone,
    setCustomerPhone: (value: string) => {
      setCustomerPhone(value);
      resetSubmission();
    },
    customerEmail,
    setCustomerEmail: (value: string) => {
      setCustomerEmail(value);
      resetSubmission();
    },
    customerEmailError: validEmail ? undefined : "Enter a valid email address.",
    availableTimes,
    canSubmit,
    availabilityLoading: availability.isPending || availability.isFetching,
    availabilityError: availability.error?.message,
    retryAvailability: () => void availability.refetch(),
    requiresRestaurantConfirmation: availability.data?.requiresRestaurantConfirmation ?? false,
    submissionPending: createMutation.isPending,
    submissionError: createMutation.error?.message,
    changeReservationUnsupported: Boolean(changeReservationId),
    submittedReservation,
    successOpened,
    closeSuccess: () => setSuccessOpened(false),
    submit,
  };
}
