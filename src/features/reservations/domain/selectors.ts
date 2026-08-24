import {
  ReservationStatus,
  type CustomerReservation,
} from "@/features/reservations/domain/types";

/** Finds a reservation without exposing collection lookup logic to components. */
export function findReservationById(
  reservations: CustomerReservation[],
  id: string,
) {
  return reservations.find((reservation) => reservation.id === id);
}

/** Returns upcoming confirmed reservations with QR tokens, nearest first. */
export function getUpcomingConfirmedReservations(
  reservations: CustomerReservation[],
  currentSlot: string,
) {
  return reservations
    .filter(
      (reservation) =>
        reservation.status === ReservationStatus.Confirmed &&
        reservation.checkInToken &&
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
  };
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
