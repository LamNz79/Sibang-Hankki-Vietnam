import {
  ReservationStatus,
  VisitStatus,
} from "@/features/reservations/types";

/** Loyalty segment assigned to an owner-side guest profile. */
export type GuestTier = "vip" | "regular" | "new";

/** Customer response visible to staff during an alternative-time workflow. */
export type OwnerCustomerResponse =
  | {
      kind: "awaiting-customer";
      proposedDate: string;
      proposedTime: string;
      message?: string;
    }
  | {
      kind: "accepted-alternative";
      previousDate?: string;
      previousTime?: string;
    }
  | {
      kind: "declined-alternative";
      proposedDate?: string;
      proposedTime?: string;
    }
  | {
      kind: "requested-another-time";
      previousDate?: string;
      previousTime?: string;
    };

/** Reservation shape consumed by owner operational screens. */
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
  customerResponse?: OwnerCustomerResponse;
};

/** Compact guest record used by the owner guest-management prototype. */
export type OwnerGuest = {
  id: string;
  name: string;
  initials: string;
  visits: number;
  tier: GuestTier;
  note: string;
};

/** Marketing campaign summary used by the owner marketing prototype. */
export type OwnerCampaign = {
  id: string;
  name: string;
  status: "Active" | "Scheduled" | "Draft";
  detail: string;
  bookings: string;
  color: string;
};
