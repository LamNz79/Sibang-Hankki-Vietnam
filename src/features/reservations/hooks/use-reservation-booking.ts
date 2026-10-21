"use client";

import { useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import type { RestaurantRecord } from "@/features/restaurants/data/types";
import {
  createCheckInToken,
  saveReservation,
} from "@/features/reservations/data/reservation-storage";
import {
  ReservationStatus,
  VisitStatus,
  type CustomerReservation,
} from "@/features/reservations/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAvailability } from "@/features/reservations/data/availability";
import { createReservation } from "@/features/reservations/data/create-reservation";
import { buildPreOrderNote } from "@/features/reservations/domain/pre-order";
import {
  useCustomerReservation,
  useRequestAnotherTime,
  useRequestReservationChange,
} from "@/features/reservations/hooks/use-customer-reservations";

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
  const [specialRequest, setSpecialRequest] = useState("");
  const [preOrderNote, setPreOrderNote] = useState("");
  const [preOrderQuantities, setPreOrderQuantities] = useState<
    Record<string, number>
  >({});
  const [changeMessage, setChangeMessage] = useState("");
  const [submittedReservation, setSubmittedReservation] =
    useState<CustomerReservation | null>(null);
  const [successOpened, setSuccessOpened] = useState(false);
  const idempotencyKey = useRef<string | null>(null);
  const changingReservation = useCustomerReservation(changeReservationId ?? "");
  const changeMutation = useRequestAnotherTime(changingReservation);
  const directChangeMutation = useRequestReservationChange(changingReservation);
  const partySize = changingReservation?.guests ?? selectedGuests;

  const selectedDateIso =
    selectedDate ?? bookingStartDate.format("YYYY-MM-DD");
  const availability = useQuery({
    queryKey: ["availability", restaurant.slug, selectedDateIso, partySize],
    queryFn: ({ signal }) => getAvailability(restaurant.slug, selectedDateIso, partySize, signal),
    retry: false,
    enabled: !changeReservationId || Boolean(changingReservation),
  });
  const availableTimes = availability.isFetching || availability.isError
    ? [] : availability.data?.slots ?? [];
  const validEmail = !customerEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail);
  const submittedPreOrderNote = buildPreOrderNote(
    restaurant.menuCategories,
    preOrderQuantities,
    preOrderNote,
  );
  const preOrderTooLong = submittedPreOrderNote.length > 1000;
  const createMutation = useMutation({
    mutationFn: createReservation,
    onSuccess: (response) => {
      const reservation: CustomerReservation = {
        id: response.id,
        reference: response.reference,
        managementToken: response.managementToken ?? undefined,
        accountLinked: !response.managementToken,
        restaurantSlug: response.restaurantSlug,
        restaurantName: restaurant.name,
        district: restaurant.district,
        cuisineLabel: restaurant.cuisineLabel,
        restaurantImageUrl: restaurant.imageUrl ?? undefined,
        restaurantImageAlt: restaurant.imageAlt ?? undefined,
        date: response.date,
        time: response.time,
        guests: response.partySize,
        specialRequest: specialRequest.trim() || undefined,
        preOrder: submittedPreOrderNote || undefined,
        status:
          response.status === "CONFIRMED"
            ? ReservationStatus.Confirmed
            : ReservationStatus.Pending,
        visitStatus:
          response.status === "CONFIRMED" ? VisitStatus.Expected : undefined,
        createdAt: response.createdAt,
        updatedAt: response.createdAt,
      };

      saveReservation(reservation);
      setSubmittedReservation(reservation);
      setSuccessOpened(true);
    },
  });
  const canSubmitNewReservation = Boolean(
    selectedTime &&
      availableTimes.includes(selectedTime) &&
      customerName.trim() &&
      customerPhone.trim() &&
      validEmail &&
      !preOrderTooLong &&
      !createMutation.isPending,
  );
  const canSubmitChange = Boolean(
    changeReservationId &&
      changingReservation &&
      changingReservation.changeRequest?.status !== "PENDING" &&
      (changingReservation.status === ReservationStatus.Pending ||
        (changingReservation.status === ReservationStatus.Confirmed &&
          (!changingReservation.visitStatus ||
            changingReservation.visitStatus === VisitStatus.Expected))) &&
      changingReservation.restaurantSlug === restaurant.slug &&
      selectedTime &&
      availableTimes.includes(selectedTime) &&
      !changeMutation.isPending,
  );
  const canSubmit = changeReservationId
    ? canSubmitChange
    : canSubmitNewReservation;

  const resetSubmission = () => {
    idempotencyKey.current = null;
    createMutation.reset();
    changeMutation.reset();
    directChangeMutation.reset();
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

    if (changeReservationId) {
      const mutation = changingReservation?.alternativeProposal?.id
        ? changeMutation
        : directChangeMutation;
      mutation.mutate(
        {
          date: selectedDate,
          time: selectedTime,
          ...(!changingReservation?.alternativeProposal?.id
            ? { message: changeMessage.trim() || undefined }
            : {}),
        },
        {
          onSuccess: (reservation) => {
            setSubmittedReservation(reservation);
            setSuccessOpened(true);
          },
        },
      );
      return;
    }

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
      specialRequest: specialRequest.trim() || undefined,
      preOrderNote: submittedPreOrderNote || undefined,
    });
  };

  return {
    bookingStartDate: bookingStartDate.format("YYYY-MM-DD"),
    bookingEndDate: bookingEndDate.format("YYYY-MM-DD"),
    selectedDate,
    selectDate,
    selectedGuests: partySize,
    changingReservation,
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
    customerEmailInvalid: !validEmail,
    specialRequest,
    setSpecialRequest: (value: string) => {
      setSpecialRequest(value);
      resetSubmission();
    },
    preOrderNote,
    setPreOrderNote: (value: string) => {
      setPreOrderNote(value);
      resetSubmission();
    },
    preOrderQuantities,
    setPreOrderQuantity: (itemId: string, quantity: number) => {
      setPreOrderQuantities((current) => {
        const next = { ...current };
        if (quantity > 0) next[itemId] = Math.min(quantity, 20);
        else delete next[itemId];
        return next;
      });
      resetSubmission();
    },
    preOrderTooLong,
    changeMessage,
    setChangeMessage: (value: string) => {
      setChangeMessage(value);
      resetSubmission();
    },
    availableTimes,
    canSubmit,
    availabilityLoading: availability.isPending || availability.isFetching,
    availabilityError: availability.error?.message,
    retryAvailability: () => void availability.refetch(),
    requiresRestaurantConfirmation: availability.data?.requiresRestaurantConfirmation ?? false,
    submissionPending:
      createMutation.isPending ||
      changeMutation.isPending ||
      directChangeMutation.isPending,
    submissionError:
      createMutation.error?.message ??
      changeMutation.error?.message ??
      directChangeMutation.error?.message,
    changeReservationUnavailable: Boolean(
      changeReservationId && changingReservation && !canSubmitChange &&
      changingReservation.changeRequest?.status === "PENDING",
    ),
    submittedReservation,
    successOpened,
    closeSuccess: () => setSuccessOpened(false),
    submit,
  };
}
