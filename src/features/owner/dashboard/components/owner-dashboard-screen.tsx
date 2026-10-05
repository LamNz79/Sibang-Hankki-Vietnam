"use client";

import { useState } from "react";
import { Alert, Button, Loader, Stack } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { PrimaryActionButton } from "@/components/ui";
import { OwnerDashboardOverview } from "@/features/owner/dashboard/components/owner-dashboard-overview";
import { OwnerDashboardToolbar } from "@/features/owner/dashboard/components/owner-dashboard-toolbar";
import { OwnerFilterDrawer } from "@/features/owner/dashboard/components/owner-filter-drawer";
import { OwnerReservationList } from "@/features/owner/dashboard/components/owner-reservation-list";
import { OwnerWalkInModal } from "@/features/owner/dashboard/components/owner-walk-in-modal";
import { useOwnerDashboard } from "@/features/owner/dashboard/hooks/use-owner-dashboard";
import { OwnerShell } from "@/features/owner/shared";

/** Coordinates the owner daily-operations dashboard presentation components. */
export function OwnerDashboardScreen() {
  const dashboard = useOwnerDashboard();
  const [filtersOpened, setFiltersOpened] = useState(false);
  const [walkInOpened, setWalkInOpened] = useState(false);

  return (
    <>
      <OwnerShell
        title="The Royal Pavilion"
        eyebrow="Today · Service overview"
        footerAction={
          <PrimaryActionButton
            leftSection={<IconPlus size={20} />}
            disabled
          >
            Add walk-in
          </PrimaryActionButton>
        }
      >
        <Stack gap="lg">
          <OwnerDashboardToolbar
            dateLabel={dashboard.dateLabel}
            isToday={dashboard.isToday}
            searchQuery={dashboard.searchQuery}
            hasActiveFilters={dashboard.hasActiveFilters}
            activeFilterCount={dashboard.activeFilterCount}
            onPreviousDay={dashboard.selectPreviousDay}
            onNextDay={dashboard.selectNextDay}
            onReturnToToday={dashboard.returnToToday}
            onSearchChange={dashboard.setSearchQuery}
            onOpenFilters={() => setFiltersOpened(true)}
          />

          {dashboard.reservationsLoading ? <Loader mx="auto" /> : null}
          {dashboard.reservationsError ? (
            <Alert color="red" title="Unable to load reservations">
              <Button
                mt="sm"
                size="xs"
                variant="outline"
                color="red"
                onClick={dashboard.retryReservations}
              >
                Try again
              </Button>
            </Alert>
          ) : null}

          {!dashboard.reservationsLoading &&
          !dashboard.reservationsError &&
          !dashboard.isRefining ? (
            <OwnerDashboardOverview
              summary={dashboard.summary}
              actionRequiredReservations={
                dashboard.actionRequiredReservations
              }
              nextArrival={dashboard.nextArrival}
            />
          ) : null}

          {!dashboard.reservationsLoading && !dashboard.reservationsError ? (
            <OwnerReservationList
              reservations={dashboard.filteredReservations}
              searchQuery={dashboard.searchQuery}
            />
          ) : null}
        </Stack>
      </OwnerShell>

      <OwnerFilterDrawer
        opened={filtersOpened}
        statusFilter={dashboard.statusFilter}
        guestFilters={dashboard.guestFilters}
        hasActiveFilters={dashboard.hasActiveFilters}
        reservationCount={dashboard.filteredReservations.length}
        onClose={() => setFiltersOpened(false)}
        onStatusChange={dashboard.setStatusFilter}
        onGuestFilterToggle={dashboard.toggleGuestFilter}
        onReset={dashboard.resetFilters}
        getStatusCount={dashboard.getStatusCount}
        getGuestCount={dashboard.getGuestCount}
      />

      <OwnerWalkInModal
        opened={walkInOpened}
        onClose={() => setWalkInOpened(false)}
      />
    </>
  );
}
