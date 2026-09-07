export type AdminReservationStatus =
  | "checkedIn"
  | "noShowReview"
  | "confirmed"
  | "cancelled";

export type AdminReservationRecord = {
  id: string;
  channel: "app" | "web";
  customer: string;
  store: string;
  time: string;
  partySize: number;
  checkIn: "qrComplete" | "pending" | "none";
  status: AdminReservationStatus;
  daysAgo: number;
};

export const adminReservationRecords: AdminReservationRecord[] = [
  {
    id: "RES-DEMO-001",
    channel: "app",
    customer: "Demo Customer A",
    store: "Demo Bistro A",
    time: "18:30",
    partySize: 3,
    checkIn: "qrComplete",
    status: "checkedIn",
    daysAgo: 0,
  },
  {
    id: "RES-DEMO-002",
    channel: "app",
    customer: "Demo Customer B",
    store: "Demo Table C",
    time: "19:00",
    partySize: 2,
    checkIn: "none",
    status: "noShowReview",
    daysAgo: 0,
  },
  {
    id: "RES-DEMO-003",
    channel: "web",
    customer: "Demo Customer C",
    store: "Demo Dining B",
    time: "19:30",
    partySize: 4,
    checkIn: "pending",
    status: "confirmed",
    daysAgo: 0,
  },
  {
    id: "RES-DEMO-004",
    channel: "app",
    customer: "Demo Customer D",
    store: "Demo Kitchen D",
    time: "20:00",
    partySize: 2,
    checkIn: "none",
    status: "cancelled",
    daysAgo: 0,
  },
  {
    id: "RES-DEMO-005",
    channel: "web",
    customer: "Demo Customer E",
    store: "Demo Bistro A",
    time: "12:30",
    partySize: 2,
    checkIn: "qrComplete",
    status: "checkedIn",
    daysAgo: 3,
  },
  {
    id: "RES-DEMO-006",
    channel: "app",
    customer: "Demo Customer F",
    store: "Demo Dining B",
    time: "18:00",
    partySize: 5,
    checkIn: "none",
    status: "cancelled",
    daysAgo: 12,
  },
];

export function filterAdminReservations(
  records: AdminReservationRecord[],
  query: string,
  status: AdminReservationStatus | "all",
  period: "today" | "last7Days" | "thisMonth",
) {
  const normalizedQuery = query.trim().toLowerCase();
  const maximumAge = period === "today" ? 0 : period === "last7Days" ? 6 : 30;

  return records.filter((reservation) => {
    const matchesQuery =
      !normalizedQuery ||
      `${reservation.id} ${reservation.customer} ${reservation.store}`
        .toLowerCase()
        .includes(normalizedQuery);

    return (
      matchesQuery &&
      (status === "all" || reservation.status === status) &&
      reservation.daysAgo <= maximumAge
    );
  });
}
