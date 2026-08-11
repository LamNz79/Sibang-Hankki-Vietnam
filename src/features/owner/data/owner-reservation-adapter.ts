import type { OwnerReservation } from "@/features/owner/types";
import type { CustomerReservation } from "@/features/reservations/types";
import {
  ReservationCustomerAction,
  ReservationStatus,
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

/**
 * Overlays customer-side reservation changes onto owner prototype records.
 * Unmatched owner records retain their original object identity.
 */
export function mergeOwnerReservationsWithCustomerState(
  ownerReservations: OwnerReservation[],
  customerReservations: CustomerReservation[],
) {
  return ownerReservations.map((ownerReservation) => {
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
      customerResponse: getCustomerResponse(customerReservation),
    };
  });
}
