export type CustomerReservationStatus = "pending" | "confirmed";

export interface CustomerReservation {
  id: string;
  restaurantSlug: string;
  restaurantName: string;
  district: string;
  cuisineLabel: string;
  date: string;
  time: string;
  guests: number;
  status: CustomerReservationStatus;
  createdAt: string;
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
  const next = [reservation, ...getReservationsSnapshot().filter((item) => item.id !== reservation.id)];
  const raw = JSON.stringify(next);

  window.localStorage.setItem(storageKey, raw);
  cachedRaw = raw;
  cachedReservations = next;
  window.dispatchEvent(new Event(changedEvent));
}
