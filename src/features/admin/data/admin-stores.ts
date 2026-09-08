export type AdminStoreStatus =
  | "draft"
  | "pending"
  | "changesRequested"
  | "active"
  | "suspended";

export type AdminStoreRegion = "hoChiMinh" | "hanoi" | "daNang";

export type AdminStoreRecord = {
  id: string;
  name: string;
  region: AdminStoreRegion;
  category: "vietnamese" | "korean" | "fusion";
  manager: string;
  todayBookings: number | null;
  commission: number | null;
  status: AdminStoreStatus;
};

export const adminStoreRecords: AdminStoreRecord[] = [
  {
    id: "STORE-DEMO-001",
    name: "Demo Bistro A",
    region: "hoChiMinh",
    category: "vietnamese",
    manager: "Demo Manager A",
    todayBookings: 62,
    commission: 4.5,
    status: "active",
  },
  {
    id: "STORE-DEMO-002",
    name: "Demo Dining B",
    region: "hanoi",
    category: "korean",
    manager: "Demo Manager B",
    todayBookings: null,
    commission: null,
    status: "pending",
  },
  {
    id: "STORE-DEMO-003",
    name: "Demo Table C",
    region: "daNang",
    category: "fusion",
    manager: "Demo Manager C",
    todayBookings: 28,
    commission: 5,
    status: "active",
  },
  {
    id: "STORE-DEMO-004",
    name: "Demo Kitchen D",
    region: "hoChiMinh",
    category: "vietnamese",
    manager: "Demo Manager D",
    todayBookings: 0,
    commission: 4.5,
    status: "suspended",
  },
  {
    id: "STORE-DEMO-005",
    name: "Demo Seoul Table",
    region: "hanoi",
    category: "korean",
    manager: "Demo Manager E",
    todayBookings: null,
    commission: null,
    status: "changesRequested",
  },
  {
    id: "STORE-DEMO-006",
    name: "Demo Riverside",
    region: "daNang",
    category: "fusion",
    manager: "Demo Manager F",
    todayBookings: null,
    commission: null,
    status: "draft",
  },
];

export function filterAdminStores(
  records: AdminStoreRecord[],
  query: string,
  status: AdminStoreStatus | "all",
  region: AdminStoreRegion | "all",
) {
  const normalizedQuery = query.trim().toLowerCase();

  return records.filter((store) => {
    const matchesQuery =
      !normalizedQuery ||
      `${store.id} ${store.name} ${store.manager}`
        .toLowerCase()
        .includes(normalizedQuery);

    return (
      matchesQuery &&
      (status === "all" || store.status === status) &&
      (region === "all" || store.region === region)
    );
  });
}
