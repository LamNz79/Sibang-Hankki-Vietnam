import {
  ReservationCustomerAction,
  ReservationStatus,
  type AlternativeProposalInput,
  type CustomerReservation,
  type ReservationRequestInput,
} from "@/features/reservations/domain/types";

/**
 * Creates a pending reservation request without reading storage or system time.
 * When `existing` is provided, booking context is preserved and the request is
 * marked as a customer request for another time.
 */
export function createReservationRequest(
  input: ReservationRequestInput,
  now: string,
  existing?: CustomerReservation,
): CustomerReservation {
  return {
    ...input,
    status: ReservationStatus.Pending,
    reference: existing?.reference,
    previousDate: existing?.date,
    previousTime: existing?.time,
    preOrder: existing?.preOrder,
    specialRequest: existing?.specialRequest,
    customerAction: existing
      ? ReservationCustomerAction.RequestedAnotherTime
      : undefined,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

/**
 * Moves a reservation into the alternative-proposed state.
 * The caller supplies `now` so the transition remains deterministic and testable.
 */
export function proposeAlternative(
  input: AlternativeProposalInput,
  now: string,
  existing?: CustomerReservation,
): CustomerReservation {
  return {
    ...existing,
    id: input.id,
    restaurantSlug: input.restaurantSlug,
    restaurantName: input.restaurantName,
    district: input.district,
    cuisineLabel: input.cuisineLabel,
    date: input.date,
    time: input.time,
    guests: input.guests,
    reference: input.reference ?? existing?.reference,
    preOrder: input.preOrder ?? existing?.preOrder,
    specialRequest: input.specialRequest ?? existing?.specialRequest,
    status: ReservationStatus.AlternativeProposed,
    customerAction: undefined,
    alternativeProposal: {
      date: input.proposedDate,
      time: input.proposedTime,
      message: input.message,
      proposedAt: now,
      respondBy: input.respondBy,
    },
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

/**
 * Accepts the restaurant's active proposal and confirms the proposed slot.
 * Returns `undefined` when there is no proposal to accept.
 */
export function acceptAlternative(
  reservation: CustomerReservation,
  now: string,
  checkInToken: string,
): CustomerReservation | undefined {
  const proposal = reservation.alternativeProposal;
  if (!proposal) return undefined;

  return {
    ...reservation,
    previousDate: reservation.date,
    previousTime: reservation.time,
    date: proposal.date,
    time: proposal.time,
    status: ReservationStatus.Confirmed,
    checkInToken,
    customerAction: ReservationCustomerAction.AcceptedAlternative,
    alternativeProposal: undefined,
    updatedAt: now,
  };
}

/**
 * Marks an alternative proposal as declined while retaining proposal context
 * for owner-side history and response handling.
 */
export function declineAlternative(
  reservation: CustomerReservation,
  now: string,
): CustomerReservation {
  return {
    ...reservation,
    status: ReservationStatus.Declined,
    customerAction: ReservationCustomerAction.DeclinedAlternative,
    updatedAt: now,
  };
}

/** Confirms the requested slot and clears any obsolete proposal response. */
export function confirmReservation(
  reservation: CustomerReservation,
  now: string,
  checkInToken: string,
): CustomerReservation {
  return {
    ...reservation,
    status: ReservationStatus.Confirmed,
    checkInToken,
    customerAction: undefined,
    alternativeProposal: undefined,
    updatedAt: now,
  };
}

/** Records that the restaurant cannot accommodate the reservation request. */
export function rejectReservation(
  reservation: CustomerReservation,
  now: string,
): CustomerReservation {
  return {
    ...reservation,
    status: ReservationStatus.Declined,
    customerAction: undefined,
    alternativeProposal: undefined,
    updatedAt: now,
  };
}

/** Reopens a closed request for another owner response. */
export function reopenReservation(
  reservation: CustomerReservation,
  now: string,
): CustomerReservation {
  return {
    ...reservation,
    status: ReservationStatus.Pending,
    customerAction: undefined,
    alternativeProposal: undefined,
    updatedAt: now,
  };
}
