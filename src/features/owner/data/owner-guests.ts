import { VisitStatus } from "@/features/reservations/types";
import type { OwnerReservation } from "@/features/owner/types";

export type OwnerGuestSummary = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  email?: string;
  reservations: number;
  visits: number;
  noShows: number;
  lastReservation: string;
};

export function buildOwnerGuests(
  reservations: OwnerReservation[],
): OwnerGuestSummary[] {
  // shortcut: phone groups guest bookings until the backend exposes restaurant guest profiles.
  const guests = new Map<string, OwnerGuestSummary>();

  for (const reservation of reservations) {
    const id = reservation.phone?.replace(/\D/g, "") || reservation.email?.toLowerCase();
    if (!id) continue;
    const existing = guests.get(id);
    const visited = [
      VisitStatus.Arrived,
      VisitStatus.Seated,
      VisitStatus.Completed,
    ].includes(reservation.visitStatus);
    const noShow = reservation.visitStatus === VisitStatus.NoShow;

    if (!existing) {
      guests.set(id, {
        id,
        name: reservation.guestName,
        initials: reservation.initials,
        phone: reservation.phone ?? "",
        email: reservation.email,
        reservations: 1,
        visits: visited ? 1 : 0,
        noShows: noShow ? 1 : 0,
        lastReservation: reservation.date,
      });
      continue;
    }

    existing.reservations += 1;
    existing.visits += visited ? 1 : 0;
    existing.noShows += noShow ? 1 : 0;
    if (reservation.date > existing.lastReservation) {
      existing.name = reservation.guestName;
      existing.initials = reservation.initials;
      existing.phone = reservation.phone ?? existing.phone;
      existing.email = reservation.email ?? existing.email;
      existing.lastReservation = reservation.date;
    }
  }

  return [...guests.values()].sort((left, right) =>
    right.lastReservation.localeCompare(left.lastReservation),
  );
}

export function getOwnerGuestStats(guests: OwnerGuestSummary[]) {
  const visitedGuests = guests.filter(({ visits }) => visits > 0).length;
  const repeatGuests = guests.filter(({ visits }) => visits > 1).length;
  return {
    profiles: guests.length,
    repeatGuests,
    returnRate: visitedGuests
      ? Math.round((repeatGuests / visitedGuests) * 100)
      : 0,
  };
}
