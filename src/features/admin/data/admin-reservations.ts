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
  date: string;
  language: "en" | "vi" | "ko";
  phone: string;
  email: string;
  request: string;
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
    date: "2026-09-09",
    language: "vi",
    phone: "+84 90 123 4567",
    email: "customer.a@example.test",
    request: "Window seat",
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
    date: "2026-09-09",
    language: "vi",
    phone: "+84 91 234 5678",
    email: "customer.b@example.test",
    request: "No special request",
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
    date: "2026-09-09",
    language: "ko",
    phone: "+82 10 3456 7890",
    email: "customer.c@example.test",
    request: "Birthday dinner",
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
    date: "2026-09-09",
    language: "en",
    phone: "+84 93 456 7890",
    email: "customer.d@example.test",
    request: "Quiet table",
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
    date: "2026-09-06",
    language: "en",
    phone: "+84 94 567 8901",
    email: "customer.e@example.test",
    request: "No special request",
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
    date: "2026-08-28",
    language: "ko",
    phone: "+82 10 6789 0123",
    email: "customer.f@example.test",
    request: "Nut allergy",
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

export function getAdminReservationById(id: string) {
  return adminReservationRecords.find((reservation) => reservation.id === id);
}
