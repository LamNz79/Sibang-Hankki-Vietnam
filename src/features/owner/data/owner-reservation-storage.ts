import {
  createOwnerReservationOverride,
  type OwnerReservationOverridePatch,
} from "@/features/owner/domain/owner-reservation-operations";
import type { OwnerReservationOverride } from "@/features/owner/types";
import {
  confirmReservationRequest,
  rejectReservationRequest,
  reopenReservationRequest,
} from "@/features/reservations/data/reservation-storage";
import {
  ReservationStatus,
  type VisitStatus,
} from "@/features/reservations/types";

const storageKey = "sibang-owner-reservation-overrides";
const changedEvent = "sibang-owner-reservations-changed";

let cachedRaw: string | null = null;
let cachedOverrides: OwnerReservationOverride[] = [];
const emptyServerSnapshot: OwnerReservationOverride[] = [];

/** Safely parses owner operational overrides from prototype storage. */
function parseOverrides(raw: string | null) {
  if (!raw) return [];

  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? (value as OwnerReservationOverride[]) : [];
  } catch {
    return [];
  }
}

/** Returns the latest cached owner operational state. */
export function getOwnerReservationOverridesSnapshot() {
  if (typeof window === "undefined") return cachedOverrides;

  const raw = window.localStorage.getItem(storageKey);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedOverrides = parseOverrides(raw);
  }

  return cachedOverrides;
}

/** Provides a stable server snapshot for `useSyncExternalStore`. */
export function getOwnerReservationOverridesServerSnapshot() {
  return emptyServerSnapshot;
}

/** Subscribes to owner reservation changes in the same or another tab. */
export function subscribeToOwnerReservationOverrides(
  onStoreChange: () => void,
) {
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

/** Persists one owner override and publishes the new snapshot. */
function saveOwnerReservationOverride(
  id: string,
  patch: OwnerReservationOverridePatch,
) {
  const current = getOwnerReservationOverridesSnapshot().find(
    (item) => item.id === id,
  );
  const nextOverride = createOwnerReservationOverride(
    id,
    patch,
    new Date().toISOString(),
    current,
  );
  const next = [
    nextOverride,
    ...getOwnerReservationOverridesSnapshot().filter((item) => item.id !== id),
  ];
  const raw = JSON.stringify(next);

  window.localStorage.setItem(storageKey, raw);
  cachedRaw = raw;
  cachedOverrides = next;
  window.dispatchEvent(new Event(changedEvent));
  return nextOverride;
}

/** Confirms a request in both customer storage and owner operational state. */
export function confirmOwnerReservation(id: string) {
  confirmReservationRequest(id);
  return saveOwnerReservationOverride(id, {
    reservationStatus: ReservationStatus.Confirmed,
    requestResponse: { kind: "pending" },
  });
}

/** Rejects a request with a customer-visible operational reason. */
export function rejectOwnerReservation(id: string, reason: string) {
  rejectReservationRequest(id);
  return saveOwnerReservationOverride(id, {
    reservationStatus: ReservationStatus.Declined,
    requestResponse: { kind: "unavailable", reason },
  });
}

/** Reopens a previously rejected request. */
export function reopenOwnerReservation(id: string) {
  reopenReservationRequest(id);
  return saveOwnerReservationOverride(id, {
    reservationStatus: ReservationStatus.Pending,
    requestResponse: { kind: "pending" },
  });
}

/** Persists the current restaurant visit lifecycle state. */
export function updateOwnerVisitStatus(id: string, visitStatus: VisitStatus) {
  return saveOwnerReservationOverride(id, { visitStatus });
}
