import { describe, expect, it } from "vitest";
import {
  adminReservationRecords,
  filterAdminReservations,
  getAdminReservationById,
} from "@/features/admin/data/admin-reservations";

describe("filterAdminReservations", () => {
  it("combines query, status, and period filters", () => {
    expect(
      filterAdminReservations(
        adminReservationRecords,
        "bistro",
        "checkedIn",
        "today",
      ).map(({ id }) => id),
    ).toEqual(["RES-DEMO-001"]);
    expect(
      filterAdminReservations(
        adminReservationRecords,
        "",
        "all",
        "last7Days",
      ),
    ).toHaveLength(5);
  });

  it("finds a reservation by ID", () => {
    expect(getAdminReservationById("RES-DEMO-003")?.customer).toBe(
      "Demo Customer C",
    );
    expect(getAdminReservationById("UNKNOWN")).toBeUndefined();
  });
});
