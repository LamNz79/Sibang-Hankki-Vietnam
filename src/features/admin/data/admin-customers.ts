export type AdminCustomerStatus = "active" | "review" | "restricted" | "closed";
export type AdminCustomerTier = "regular" | "vip";

export type AdminCustomerRecord = {
  id: string;
  name: string;
  contact: string;
  country: "vietnam" | "korea";
  language: "vi" | "en" | "ko";
  reservations: number;
  visits: number;
  noShows: number;
  joined: string;
  status: AdminCustomerStatus;
  tier: AdminCustomerTier;
};

export const adminCustomerRecords: AdminCustomerRecord[] = [
  {
    id: "CUS-DEMO-001",
    name: "Demo Customer A",
    contact: "c***@example.test",
    country: "vietnam",
    language: "vi",
    reservations: 18,
    visits: 14,
    noShows: 0,
    joined: "2026-07-12",
    status: "active",
    tier: "regular",
  },
  {
    id: "CUS-DEMO-002",
    name: "Demo Customer B",
    contact: "+84 *** *** 001",
    country: "vietnam",
    language: "en",
    reservations: 7,
    visits: 4,
    noShows: 2,
    joined: "2026-07-21",
    status: "review",
    tier: "regular",
  },
  {
    id: "CUS-DEMO-003",
    name: "Demo Customer C",
    contact: "c***@example.test",
    country: "korea",
    language: "ko",
    reservations: 4,
    visits: 4,
    noShows: 0,
    joined: "2026-08-03",
    status: "active",
    tier: "vip",
  },
  {
    id: "CUS-DEMO-004",
    name: "Demo Customer D",
    contact: "+84 *** *** 004",
    country: "vietnam",
    language: "vi",
    reservations: 11,
    visits: 6,
    noShows: 3,
    joined: "2026-08-10",
    status: "restricted",
    tier: "regular",
  },
  {
    id: "CUS-DEMO-005",
    name: "Demo Customer E",
    contact: "e***@example.test",
    country: "korea",
    language: "en",
    reservations: 9,
    visits: 8,
    noShows: 0,
    joined: "2026-08-18",
    status: "active",
    tier: "vip",
  },
  {
    id: "CUS-DEMO-006",
    name: "Demo Customer F",
    contact: "+84 *** *** 006",
    country: "vietnam",
    language: "vi",
    reservations: 2,
    visits: 1,
    noShows: 1,
    joined: "2026-08-24",
    status: "closed",
    tier: "regular",
  },
];

export function filterAdminCustomers(
  records: AdminCustomerRecord[],
  query: string,
  status: AdminCustomerStatus | "all",
  tier: AdminCustomerTier | "all",
) {
  const normalizedQuery = query.trim().toLowerCase();

  return records.filter((customer) => {
    const matchesQuery =
      !normalizedQuery ||
      `${customer.id} ${customer.name} ${customer.contact}`
        .toLowerCase()
        .includes(normalizedQuery);

    return (
      matchesQuery &&
      (status === "all" || customer.status === status) &&
      (tier === "all" || customer.tier === tier)
    );
  });
}
