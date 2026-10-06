"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, Button, Group, Modal, SimpleGrid, Stack, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { getReservationStatusFlags } from "@/features/reservations/domain/selectors";
import type { CustomerReservation } from "@/features/reservations/types";

type ReservationDetailActionsProps = {
  reservation: CustomerReservation;
  onCancel: () => void;
  cancelPending: boolean;
  cancelError: boolean;
};

/** Shows the actions available for the current customer reservation status. */
export function ReservationDetailActions({
  reservation,
  onCancel,
  cancelPending,
  cancelError,
}: ReservationDetailActionsProps) {
  const t = useTranslations("CustomerReservationDetails.actions");
  const [cancelOpened, setCancelOpened] = useState(false);
  const { isPending, isAlternative, isConfirmed, isDeclined, isCancelled } =
    getReservationStatusFlags(reservation);
  const canCancel = Boolean(
    reservation.managementToken && (isPending || isConfirmed),
  );

  if (isAlternative) return null;

  if (isDeclined || isCancelled) {
    return (
      <Button
        component={Link}
        href={`/reservation?restaurant=${reservation.restaurantSlug}`}
        fullWidth
        color="warmCoral"
      >
        {t("newReservation")}
      </Button>
    );
  }

  return (
    <>
      <SimpleGrid cols={2} spacing="sm">
        <Button
          variant="outline"
          color="gray"
          radius="md"
          disabled
          title={t("changeHint")}
        >
          {isPending ? t("changeRequest") : t("change")}
        </Button>
        <Button
          variant="outline"
          color="red"
          radius="md"
          disabled={!canCancel}
          title={!canCancel ? t("cancelHint") : undefined}
          onClick={() => setCancelOpened(true)}
        >
          {isPending ? t("cancelRequest") : t("cancel")}
        </Button>
      </SimpleGrid>

      <Modal
        opened={cancelOpened}
        onClose={() => setCancelOpened(false)}
        title={t("cancelTitle")}
        centered
      >
        <Stack gap="md">
          <Text size="sm">{t("cancelDescription")}</Text>
          {cancelError ? (
            <Alert color="red" title={t("cancelError")} role="alert" />
          ) : null}
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setCancelOpened(false)}>
              {t("keep")}
            </Button>
            <Button color="red" loading={cancelPending} onClick={onCancel}>
              {t("confirmCancel")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
