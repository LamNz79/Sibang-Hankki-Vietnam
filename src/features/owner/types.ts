import {
  ReservationStatus,
  VisitStatus,
  type ReservationDisplayStatus,
} from "@/features/reservations/types";

export type GuestTier = "vip" | "regular" | "new";

export type OwnerReservation = {
  id: string;
  time: string;
  guestName: string;
  initials: string;
  date: string;
  table: string;
  partySize: number;
  reservationStatus: ReservationStatus;
  visitStatus: VisitStatus;
  tier?: GuestTier;
  preOrder?: boolean;
  preOrderName?: string;
  note?: string;
  phone?: string;
  reference: string;
  visits: number;
  points: number;
  lastVisit?: string;
};

export function getOwnerReservationDisplayStatus(
  reservation: OwnerReservation,
): ReservationDisplayStatus {
  return reservation.visitStatus === VisitStatus.Expected
    ? reservation.reservationStatus
    : reservation.visitStatus;
}

export type OwnerGuest = {
  id: string;
  name: string;
  initials: string;
  visits: number;
  tier: GuestTier;
  note: string;
};

export type OwnerCampaign = {
  id: string;
  name: string;
  status: "Active" | "Scheduled" | "Draft";
  detail: string;
  bookings: string;
  color: string;
};
