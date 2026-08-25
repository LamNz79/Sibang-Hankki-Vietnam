import type { OwnerReservation } from "@/features/owner/types";
import { getReservationReference } from "@/features/reservations/domain/selectors";
import type { CustomerReservation } from "@/features/reservations/types";
import {
  ReservationCustomerAction,
  ReservationStatus,
  VisitStatus,
} from "@/features/reservations/types";

/** Matches records by internal id, then by booking reference as a fallback. */
function matchesCustomerReservation(
  ownerReservation: OwnerReservation,
  customerReservation: CustomerReservation,
) {
  return (
    ownerReservation.id === customerReservation.id ||
    Boolean(
      customerReservation.reference &&
        ownerReservation.reference === customerReservation.reference,
    )
  );
}

/** Derives the response state owner screens should display for customer actions. */
function getCustomerResponse(
  customerReservation: CustomerReservation,
): OwnerReservation["customerResponse"] {
  if (
    customerReservation.status === ReservationStatus.AlternativeProposed &&
    customerReservation.alternativeProposal
  ) {
    return {
      kind: "awaiting-customer",
      proposedDate: customerReservation.alternativeProposal.date,
      proposedTime: customerReservation.alternativeProposal.time,
      message: customerReservation.alternativeProposal.message,
    };
  }

  if (
    customerReservation.customerAction ===
      ReservationCustomerAction.AcceptedAlternative ||
    (customerReservation.status === ReservationStatus.Confirmed &&
      Boolean(
        customerReservation.previousDate || customerReservation.previousTime,
      ))
  ) {
    return {
      kind: "accepted-alternative",
      previousDate: customerReservation.previousDate,
      previousTime: customerReservation.previousTime,
    };
  }

  if (
    customerReservation.customerAction ===
      ReservationCustomerAction.DeclinedAlternative ||
    (customerReservation.status === ReservationStatus.Declined &&
      Boolean(customerReservation.alternativeProposal))
  ) {
    return {
      kind: "declined-alternative",
      proposedDate: customerReservation.alternativeProposal?.date,
      proposedTime: customerReservation.alternativeProposal?.time,
    };
  }

  if (
    customerReservation.customerAction ===
      ReservationCustomerAction.RequestedAnotherTime ||
    (customerReservation.status === ReservationStatus.Pending &&
      Boolean(
        customerReservation.previousDate || customerReservation.previousTime,
      ))
  ) {
    return {
      kind: "requested-another-time",
      previousDate: customerReservation.previousDate,
      previousTime: customerReservation.previousTime,
    };
  }

  return undefined;
}

/** Adapts a customer-created request for the current prototype customer. */
function createOwnerReservation(
  customerReservation: CustomerReservation,
): OwnerReservation {
  return {
    id: customerReservation.id,
    time: customerReservation.time,
    guestName: "Minh Lam",
    initials: "ML",
    date: customerReservation.date,
    table: "Not assigned",
    partySize: customerReservation.guests,
    reservationStatus: customerReservation.status,
    visitStatus: VisitStatus.Expected,
    tier: "new",
    preOrder: Boolean(customerReservation.preOrder),
    preOrderName: customerReservation.preOrder,
    note: customerReservation.specialRequest,
    reference: getReservationReference(customerReservation),
    checkInToken: customerReservation.checkInToken,
    visits: 0,
    points: 0,
    customerResponse: getCustomerResponse(customerReservation),
  };
}

/**
 * Overlays customer changes and appends requests missing from owner records.
 * Unmatched owner records retain their original object identity.
 */
export function mergeOwnerReservationsWithCustomerState(
  ownerReservations: OwnerReservation[],
  customerReservations: CustomerReservation[],
) {
  const mergedReservations = ownerReservations.map((ownerReservation) => {
    const customerReservation = customerReservations.find((item) =>
      matchesCustomerReservation(ownerReservation, item),
    );

    if (!customerReservation) return ownerReservation;

    return {
      ...ownerReservation,
      date: customerReservation.date,
      time: customerReservation.time,
      partySize: customerReservation.guests,
      reservationStatus: customerReservation.status,
      preOrder: customerReservation.preOrder
        ? true
        : ownerReservation.preOrder,
      preOrderName:
        customerReservation.preOrder ?? ownerReservation.preOrderName,
      note: customerReservation.specialRequest ?? ownerReservation.note,
      checkInToken:
        customerReservation.checkInToken ?? ownerReservation.checkInToken,
      customerResponse: getCustomerResponse(customerReservation),
    };
  });

  const newReservations = customerReservations
    .filter(
      (customerReservation) =>
        !ownerReservations.some((ownerReservation) =>
          matchesCustomerReservation(ownerReservation, customerReservation),
        ),
    )
    .map(createOwnerReservation);

  return [...mergedReservations, ...newReservations];
}
