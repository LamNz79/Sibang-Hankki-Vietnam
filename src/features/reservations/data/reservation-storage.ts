import {
  ReservationCustomerAction,
  ReservationStatus,
} from "@/features/reservations/types";

export interface CustomerAlternativeProposal {
  date: string;
  time: string;
  message?: string;
  proposedAt: string;
  respondBy?: string;
}

export interface CustomerReservation {
  id: string;
  restaurantSlug: string;
  restaurantName: string;
  district: string;
  cuisineLabel: string;
  date: string;
  time: string;
  guests: number;
  status: ReservationStatus;
  reference?: string;
  alternativeProposal?: CustomerAlternativeProposal;
  previousDate?: string;
  previousTime?: string;
  preOrder?: string;
  specialRequest?: string;
  customerAction?: ReservationCustomerAction;
  createdAt: string;
  updatedAt?: string;
}

const storageKey = "sibang-customer-reservations";
const changedEvent = "sibang-reservations-changed";

let cachedRaw: string | null = null;
let cachedReservations: CustomerReservation[] = [];
const emptyServerSnapshot: CustomerReservation[] = [];

function parseReservations(raw: string | null) {
  if (!raw) return [];

  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? (value as CustomerReservation[]) : [];
  } catch {
    return [];
  }
}

export function getReservationsSnapshot() {
  if (typeof window === "undefined") return cachedReservations;

  const raw = window.localStorage.getItem(storageKey);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedReservations = parseReservations(raw);
  }

  return cachedReservations;
}

export function getReservationsServerSnapshot() {
  return emptyServerSnapshot;
}

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

export function proposeAlternativeReservation(
  reservation: Omit<
    CustomerReservation,
    "status" | "createdAt" | "alternativeProposal"
  > & {
    proposedDate: string;
    proposedTime: string;
    message?: string;
    respondBy?: string;
  },
) {
  const existing = getReservationsSnapshot().find(
    (item) => item.id === reservation.id,
  );

  saveReservation({
    ...existing,
    id: reservation.id,
    restaurantSlug: reservation.restaurantSlug,
    restaurantName: reservation.restaurantName,
    district: reservation.district,
    cuisineLabel: reservation.cuisineLabel,
    date: reservation.date,
    time: reservation.time,
    guests: reservation.guests,
    reference: reservation.reference,
    status: ReservationStatus.AlternativeProposed,
    customerAction: undefined,
    alternativeProposal: {
      date: reservation.proposedDate,
      time: reservation.proposedTime,
      message: reservation.message,
      proposedAt: new Date().toISOString(),
      respondBy: reservation.respondBy,
    },
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export function acceptAlternativeProposal(id: string) {
  const reservation = getReservationsSnapshot().find((item) => item.id === id);
  const proposal = reservation?.alternativeProposal;

  if (!reservation || !proposal) return;

  saveReservation({
    ...reservation,
    previousDate: reservation.date,
    previousTime: reservation.time,
    date: proposal.date,
    time: proposal.time,
    status: ReservationStatus.Confirmed,
    customerAction: ReservationCustomerAction.AcceptedAlternative,
    alternativeProposal: undefined,
    updatedAt: new Date().toISOString(),
  });
}

export function declineAlternativeProposal(id: string) {
  const reservation = getReservationsSnapshot().find((item) => item.id === id);
  if (!reservation) return;

  saveReservation({
    ...reservation,
    status: ReservationStatus.Declined,
    customerAction: ReservationCustomerAction.DeclinedAlternative,
    updatedAt: new Date().toISOString(),
  });
}

export function getReservationReference(reservation: CustomerReservation) {
  if (reservation.reference) return reservation.reference;

  const datePart = reservation.date.replaceAll("-", "").slice(2);
  const numericId = reservation.id.replace(/\D/g, "");
  const suffix = numericId.slice(-4).padStart(4, "0");

  return `SHK-${datePart}-${suffix}`;
}
