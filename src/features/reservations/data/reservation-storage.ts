import {
  acceptAlternative,
  confirmReservation,
  createReservationRequest,
  declineAlternative,
  proposeAlternative,
  rejectReservation,
  reopenReservation,
} from "@/features/reservations/domain/transitions";
import type {
  AlternativeProposalInput,
  CustomerReservation,
} from "@/features/reservations/domain/types";

const storageKey = "sibang-customer-reservations";
const changedEvent = "sibang-reservations-changed";

let cachedRaw: string | null = null;
let cachedReservations: CustomerReservation[] = [];
const emptyServerSnapshot: CustomerReservation[] = [];

/** Safely parses persisted reservation JSON, falling back to an empty list. */
function parseReservations(raw: string | null) {
  if (!raw) return [];

  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? (value as CustomerReservation[]) : [];
  } catch {
    return [];
  }
}

/** Returns the cached client snapshot, refreshing it when local storage changes. */
export function getReservationsSnapshot() {
  if (typeof window === "undefined") return cachedReservations;

  const raw = window.localStorage.getItem(storageKey);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedReservations = parseReservations(raw);
  }

  return cachedReservations;
}

/** Provides a stable empty snapshot during server rendering. */
export function getReservationsServerSnapshot() {
  return emptyServerSnapshot;
}

/** Subscribes to same-tab and cross-tab reservation storage updates. */
export function subscribeToReservations(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key === storageKey) onStoreChange();
  };
  const handleChange = () => onStoreChange();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(changedEvent, handleChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(changedEvent, handleChange);
  };
}

/** Upserts a reservation and notifies every active subscriber. */
export function saveReservation(reservation: CustomerReservation) {
  const next = [
    reservation,
    ...getReservationsSnapshot().filter((item) => item.id !== reservation.id),
  ];
  const raw = JSON.stringify(next);

  window.localStorage.setItem(storageKey, raw);
  cachedRaw = raw;
  cachedReservations = next;
  window.dispatchEvent(new Event(changedEvent));
}

/** Input accepted by the local persistence command for a booking request. */
export type SubmitReservationRequestInput = Pick<
  CustomerReservation,
  | "restaurantSlug"
  | "restaurantName"
  | "district"
  | "cuisineLabel"
  | "date"
  | "time"
  | "guests"
> & {
  changeReservationId?: string | null;
};

/**
 * Creates or resubmits a reservation request, persists it, and returns the
 * saved record. Browser-specific ID and time generation stay at this boundary.
 */
export function submitReservationRequest(
  input: SubmitReservationRequestInput,
): CustomerReservation {
  const existing = input.changeReservationId
    ? getReservationsSnapshot().find(
        (reservation) => reservation.id === input.changeReservationId,
      )
    : undefined;
  const now = new Date().toISOString();
  const reservation = createReservationRequest(
    {
      id: existing?.id ?? `${Date.now()}-${input.restaurantSlug}`,
      restaurantSlug: input.restaurantSlug,
      restaurantName: input.restaurantName,
      district: input.district,
      cuisineLabel: input.cuisineLabel,
      date: input.date,
      time: input.time,
      guests: input.guests,
    },
    now,
    existing,
  );

  saveReservation(reservation);
  return reservation;
}

/** Persists an owner-proposed alternative slot for the customer to review. */
export function proposeAlternativeReservation(
  reservation: AlternativeProposalInput,
) {
  const existing = getReservationsSnapshot().find(
    (item) => item.id === reservation.id,
  );
  const next = proposeAlternative(
    reservation,
    new Date().toISOString(),
    existing,
  );

  saveReservation(next);
  return next;
}

/** Accepts and persists the active alternative proposal, when available. */
export function acceptAlternativeProposal(id: string) {
  const reservation = getReservationsSnapshot().find((item) => item.id === id);
  if (!reservation) return;

  const next = acceptAlternative(
    reservation,
    new Date().toISOString(),
    crypto.randomUUID(),
  );
  if (!next) return;

  saveReservation(next);
  return next;
}

/** Declines and persists the active alternative proposal. */
export function declineAlternativeProposal(id: string) {
  const reservation = getReservationsSnapshot().find((item) => item.id === id);
  if (!reservation) return;

  const next = declineAlternative(reservation, new Date().toISOString());
  saveReservation(next);
  return next;
}

/** Confirms an existing customer reservation request. */
export function confirmReservationRequest(id: string) {
  const reservation = getReservationsSnapshot().find((item) => item.id === id);
  if (!reservation) return;

  const next = confirmReservation(
    reservation,
    new Date().toISOString(),
    crypto.randomUUID(),
  );
  saveReservation(next);
  return next;
}

/** Rejects an existing customer reservation request. */
export function rejectReservationRequest(id: string) {
  const reservation = getReservationsSnapshot().find((item) => item.id === id);
  if (!reservation) return;

  const next = rejectReservation(reservation, new Date().toISOString());
  saveReservation(next);
  return next;
}

/** Reopens an existing customer reservation request. */
export function reopenReservationRequest(id: string) {
  const reservation = getReservationsSnapshot().find((item) => item.id === id);
  if (!reservation) return;

  const next = reopenReservation(reservation, new Date().toISOString());
  saveReservation(next);
  return next;
}
