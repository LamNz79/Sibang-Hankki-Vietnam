"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useOwnerReservations } from "@/features/owner/hooks/use-owner-reservations";
import {
  canOwnerReservationCheckIn,
  countOwnerReservationGuestFilter,
  countOwnerReservationStatus,
  isOwnerReservationActionRequired,
  isOwnerReservationActive,
  matchesOwnerReservationGuestFilters,
  matchesOwnerReservationSearch,
  matchesOwnerReservationStatus,
  sortOwnerReservationsPendingFirst,
  type OwnerGuestFilter,
  type OwnerReservationFilter,
} from "@/features/owner/selectors/owner-reservation-selectors";

/** Summary values displayed in the owner dashboard metric cards. */
export type OwnerDashboardSummary = {
  bookings: number;
  expectedGuests: number;
  preOrders: number;
  vipGuests: number;
};

/**
 * Owns owner-dashboard query state and derives the reservations needed by each
 * presentation component. No visual or modal state is managed here.
 */
export function useOwnerDashboard() {
  const ownerReservations = useOwnerReservations();
  const [selectedDate, setSelectedDate] = useState(dayjs().startOf("day"));
  const [statusFilter, setStatusFilter] =
    useState<OwnerReservationFilter>("all");
  const [guestFilters, setGuestFilters] = useState<OwnerGuestFilter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const reservationsForSelectedDate = useMemo(
    () =>
      ownerReservations.filter((reservation) =>
        dayjs(reservation.date).isSame(selectedDate, "day"),
      ),
    [ownerReservations, selectedDate],
  );

  const reservationsMatchingSearch = useMemo(
    () =>
      reservationsForSelectedDate.filter((reservation) =>
        matchesOwnerReservationSearch(reservation, searchQuery),
      ),
    [reservationsForSelectedDate, searchQuery],
  );

  const reservationsMatchingGuest = useMemo(
    () =>
      reservationsMatchingSearch.filter((reservation) =>
        matchesOwnerReservationGuestFilters(reservation, guestFilters),
      ),
    [guestFilters, reservationsMatchingSearch],
  );

  const reservationsMatchingStatus = useMemo(
    () =>
      reservationsMatchingSearch.filter((reservation) =>
        matchesOwnerReservationStatus(reservation, statusFilter),
      ),
    [reservationsMatchingSearch, statusFilter],
  );

  const filteredReservations = useMemo(
    () =>
      sortOwnerReservationsPendingFirst(
        reservationsMatchingSearch.filter(
          (reservation) =>
            matchesOwnerReservationStatus(reservation, statusFilter) &&
            matchesOwnerReservationGuestFilters(reservation, guestFilters),
        ),
      ),
    [guestFilters, reservationsMatchingSearch, statusFilter],
  );

  const actionRequiredReservations = reservationsForSelectedDate.filter(
    isOwnerReservationActionRequired,
  );
  const activeReservations = reservationsForSelectedDate.filter(
    isOwnerReservationActive,
  );
  const nextArrival = reservationsForSelectedDate.find(
    canOwnerReservationCheckIn,
  );
  const summary: OwnerDashboardSummary = {
    bookings: activeReservations.length,
    expectedGuests: activeReservations.reduce(
      (total, reservation) => total + reservation.partySize,
      0,
    ),
    preOrders: activeReservations.filter((reservation) => reservation.preOrder)
      .length,
    vipGuests: activeReservations.filter(
      (reservation) => reservation.tier === "vip",
    ).length,
  };

  const isToday = selectedDate.isSame(dayjs(), "day");
  const dateLabel = isToday
    ? `Today · ${selectedDate.format("dddd, MMM D")}`
    : selectedDate.format("dddd, MMM D");
  const hasActiveFilters = statusFilter !== "all" || guestFilters.length > 0;
  const activeFilterCount =
    (statusFilter === "all" ? 0 : 1) + guestFilters.length;
  const isRefining = Boolean(searchQuery.trim()) || hasActiveFilters;

  const toggleGuestFilter = (filter: OwnerGuestFilter) => {
    setGuestFilters((current) =>
      current.includes(filter)
        ? current.filter((value) => value !== filter)
        : [...current, filter],
    );
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setGuestFilters([]);
  };

  return {
    dateLabel,
    isToday,
    selectPreviousDay: () =>
      setSelectedDate((current) => current.subtract(1, "day")),
    selectNextDay: () =>
      setSelectedDate((current) => current.add(1, "day")),
    returnToToday: () => setSelectedDate(dayjs().startOf("day")),
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    guestFilters,
    toggleGuestFilter,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
    isRefining,
    filteredReservations,
    actionRequiredReservations,
    nextArrival,
    summary,
    getStatusCount: (filter: OwnerReservationFilter) =>
      countOwnerReservationStatus(reservationsMatchingGuest, filter),
    getGuestCount: (filter: OwnerGuestFilter) =>
      countOwnerReservationGuestFilter(reservationsMatchingStatus, filter),
  };
}
