export type OwnerReservationStatus =
  | "confirmed"
  | "pending"
  | "arrived"
  | "seated"
  | "completed";

export type GuestTier = "vip" | "regular" | "new";

export type OwnerReservation = {
  id: string;
  time: string;
  guestName: string;
  initials: string;
  partySize: number;
  status: OwnerReservationStatus;
  tier?: GuestTier;
  preOrder?: boolean;
  note?: string;
  phone?: string;
  reference: string;
  visits: number;
  points: number;
  lastVisit?: string;
};

export const ownerReservations: OwnerReservation[] = [
  {
    id: "res-001",
    time: "17:30",
    guestName: "Duy Nguyen",
    initials: "DN",
    partySize: 2,
    status: "confirmed",
    note: "Host check-in",
    phone: "090 123 4567",
    reference: "SHK-0720-1730",
    visits: 2,
    points: 80,
    lastVisit: "Jun 14",
  },
  {
    id: "res-002",
    time: "18:00",
    guestName: "Kim Minji",
    initials: "KM",
    partySize: 4,
    status: "confirmed",
    tier: "vip",
    preOrder: true,
    note: "Birthday · window seating",
    phone: "090 555 1800",
    reference: "SHK-0720-1800",
    visits: 7,
    points: 420,
    lastVisit: "Jul 02",
  },
  {
    id: "res-003",
    time: "18:30",
    guestName: "Park Ara",
    initials: "PA",
    partySize: 3,
    status: "pending",
    tier: "regular",
    note: "Peanut allergy",
    phone: "090 878 2211",
    reference: "SHK-0720-1830",
    visits: 3,
    points: 130,
    lastVisit: "May 28",
  },
  {
    id: "res-004",
    time: "19:00",
    guestName: "Hanna Lee",
    initials: "HL",
    partySize: 2,
    status: "confirmed",
    note: "Window request",
    phone: "090 442 1997",
    reference: "SHK-0720-1900",
    visits: 1,
    points: 40,
    lastVisit: "First visit",
  },
];

export const ownerGuests = [
  {
    id: "guest-001",
    name: "Kim Minji",
    initials: "KM",
    visits: 7,
    tier: "vip" as const,
    note: "Window seating",
  },
  {
    id: "guest-002",
    name: "Park Ara",
    initials: "PA",
    visits: 3,
    tier: "regular" as const,
    note: "Allergy note",
  },
  {
    id: "guest-003",
    name: "Lee Hwan",
    initials: "LH",
    visits: 0,
    tier: "new" as const,
    note: "First visit scheduled",
  },
];

export const ownerCampaigns = [
  {
    id: "campaign-001",
    name: "Weekday table benefit",
    status: "Active",
    detail: "7 days left",
    bookings: "86",
    color: "#198b79",
  },
  {
    id: "campaign-002",
    name: "Group dinner set",
    status: "Scheduled",
    detail: "Starts Jul 24",
    bookings: "42",
    color: "#bf6e3c",
  },
  {
    id: "campaign-003",
    name: "Regular guest thank-you",
    status: "Draft",
    detail: "138 eligible",
    bookings: "—",
    color: "#9aa7a2",
  },
];

export function getOwnerReservation(id: string) {
  return ownerReservations.find((reservation) => reservation.id === id);
}
