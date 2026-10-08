import {
  ReservationStatus,
  VisitStatus,
  type CustomerReservation,
} from "@/features/reservations/domain/types";

/** Finds a reservation without exposing collection lookup logic to components. */
export function findReservationById(
  reservations: CustomerReservation[],
  id: string,
) {
  return reservations.find((reservation) => reservation.id === id);
}

/** Returns upcoming confirmed reservations, nearest first. */
export function getUpcomingConfirmedReservations(
  reservations: CustomerReservation[],
  currentSlot: string,
) {
  return reservations
    .filter(
      (reservation) =>
        reservation.status === ReservationStatus.Confirmed &&
        (!reservation.visitStatus ||
          reservation.visitStatus === VisitStatus.Expected) &&
        `${reservation.date}T${reservation.time}` >= currentSlot,
    )
    .sort((left, right) =>
      `${left.date}T${left.time}`.localeCompare(`${right.date}T${right.time}`),
    );
}

/** Derives convenient status flags used by customer reservation screens. */
export function getReservationStatusFlags(reservation: CustomerReservation) {
  return {
    isPending: reservation.status === ReservationStatus.Pending,
    isAlternative:
      reservation.status === ReservationStatus.AlternativeProposed,
    isConfirmed: reservation.status === ReservationStatus.Confirmed,
    isDeclined: reservation.status === ReservationStatus.Declined,
    isCancelled: reservation.status === ReservationStatus.Cancelled,
  };
}

/** Shows visit progress after confirmation without changing the booking decision. */
export function getCustomerReservationDisplayStatus(
  reservation: CustomerReservation,
) {
  if (
    reservation.status === ReservationStatus.Confirmed &&
    reservation.visitStatus &&
    reservation.visitStatus !== VisitStatus.Expected
  ) {
    return reservation.visitStatus;
  }

  return reservation.status;
}

/** Splits reservations by lifecycle and visit time, sorting each section for display. */
export function partitionCustomerReservations(
  reservations: CustomerReservation[],
  currentSlot: string,
) {
  const terminalStatuses = new Set([
    ReservationStatus.Declined,
    ReservationStatus.Expired,
    ReservationStatus.Cancelled,
  ]);
  const upcoming: CustomerReservation[] = [];
  const past: CustomerReservation[] = [];

  for (const reservation of reservations) {
    const slot = getReservationDisplaySlot(reservation);
    (terminalStatuses.has(reservation.status) ||
    reservation.visitStatus === VisitStatus.Completed ||
    reservation.visitStatus === VisitStatus.NoShow ||
    `${slot.date}T${slot.time}` < currentSlot
      ? past
      : upcoming
    ).push(reservation);
  }

  const slotValue = (reservation: CustomerReservation) => {
    const slot = getReservationDisplaySlot(reservation);
    return `${slot.date}T${slot.time}`;
  };
  upcoming.sort((left, right) => slotValue(left).localeCompare(slotValue(right)));
  past.sort((left, right) => slotValue(right).localeCompare(slotValue(left)));

  return { upcoming, past };
}

/**
 * Returns the slot that should be displayed to the customer.
 * An active restaurant proposal takes precedence over the requested slot.
 */
export function getReservationDisplaySlot(reservation: CustomerReservation) {
  if (
    reservation.status === ReservationStatus.AlternativeProposed &&
    reservation.alternativeProposal
  ) {
    return {
      date: reservation.alternativeProposal.date,
      time: reservation.alternativeProposal.time,
      isSuggested: true,
    };
  }

  return {
    date: reservation.date,
    time: reservation.time,
    isSuggested: false,
  };
}

/** Returns the stored booking reference or derives a stable prototype fallback. */
export function getReservationReference(reservation: CustomerReservation) {
  if (reservation.reference) return reservation.reference;

  const datePart = reservation.date.replaceAll("-", "").slice(2);
  const numericId = reservation.id.replace(/\D/g, "");
  const suffix = numericId.slice(-4).padStart(4, "0");

  return `SHK-${datePart}-${suffix}`;
}
