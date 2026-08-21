import type { OwnerReservation } from "@/features/owner/types";
import {
  ReservationStatus,
  VisitStatus,
  type ReservationDisplayStatus,
} from "@/features/reservations/types";

/** Filter values supported by the owner reservation status control. */
export type OwnerReservationFilter = "all" | ReservationDisplayStatus;
/** Guest attributes supported by the owner reservation filter. */
export type OwnerGuestFilter = "vip" | "pre-order" | "large-party";

/**
 * Uses reservation status before arrival and operational visit status afterward.
 */
export function getOwnerReservationDisplayStatus(
  reservation: OwnerReservation,
): ReservationDisplayStatus {
  return reservation.visitStatus === VisitStatus.Expected
    ? reservation.reservationStatus
    : reservation.visitStatus;
}

/** Checks whether a reservation matches the selected owner status filter. */
export function matchesOwnerReservationStatus(
  reservation: OwnerReservation,
  filter: OwnerReservationFilter,
) {
  return (
    filter === "all" || getOwnerReservationDisplayStatus(reservation) === filter
  );
}

/** Checks that a reservation satisfies every selected guest attribute filter. */
export function matchesOwnerReservationGuestFilters(
  reservation: OwnerReservation,
  filters: OwnerGuestFilter[],
) {
  return filters.every((filter) => {
    if (filter === "vip") return reservation.tier === "vip";
    if (filter === "pre-order") return Boolean(reservation.preOrder);
    return reservation.partySize >= 4;
  });
}

/** Counts reservations matching a status filter, including the `all` option. */
export function countOwnerReservationStatus(
  reservations: OwnerReservation[],
  filter: OwnerReservationFilter,
) {
  return reservations.filter((reservation) =>
    matchesOwnerReservationStatus(reservation, filter),
  ).length;
}

/** Counts reservations matching one guest attribute filter. */
export function countOwnerReservationGuestFilter(
  reservations: OwnerReservation[],
  filter: OwnerGuestFilter,
) {
  return reservations.filter((reservation) =>
    matchesOwnerReservationGuestFilters(reservation, [filter]),
  ).length;
}

function normalizeSearchValue(value: string) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Matches normalized guest name, booking reference, or phone number. */
export function matchesOwnerReservationSearch(
  reservation: OwnerReservation,
  query: string,
) {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) return true;

  return [reservation.guestName, reservation.reference, reservation.phone]
    .filter((value): value is string => Boolean(value))
    .some((value) => normalizeSearchValue(value).includes(normalizedQuery));
}

/** Identifies requests that currently require a response from restaurant staff. */
export function isOwnerReservationActionRequired(
  reservation: OwnerReservation,
) {
  return (
    reservation.reservationStatus === ReservationStatus.Pending ||
    reservation.customerResponse?.kind === "declined-alternative"
  );
}

/** Excludes reservation requests that have already been declined. */
export function isOwnerReservationActive(reservation: OwnerReservation) {
  return reservation.reservationStatus !== ReservationStatus.Declined;
}

/** Identifies a confirmed reservation whose guest has not arrived yet. */
export function isOwnerReservationNextArrival(
  reservation: OwnerReservation,
) {
  return (
    reservation.reservationStatus === ReservationStatus.Confirmed &&
    reservation.visitStatus === VisitStatus.Expected
  );
}

/** Places pending requests first, then keeps each status group chronological. */
export function sortOwnerReservationsPendingFirst(
  reservations: OwnerReservation[],
) {
  return [...reservations].sort((first, second) => {
    const pendingDifference =
      Number(second.reservationStatus === ReservationStatus.Pending) -
      Number(first.reservationStatus === ReservationStatus.Pending);

    return pendingDifference || first.time.localeCompare(second.time);
  });
}
