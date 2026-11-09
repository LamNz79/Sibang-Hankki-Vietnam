import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

export type VnpayCheckout = {
  paymentId: string;
  status: "PENDING";
  amount: number;
  currency: "VND";
  expiresAt: string;
  checkoutUrl: string;
};

export async function createVnpayCheckout(
  reservationId: string,
  managementToken: string | undefined,
  locale: string,
): Promise<VnpayCheckout> {
  return apiFetch<VnpayCheckout>(
    `${apiEndpoints.vnpayReservationCheckout(reservationId)}?locale=${encodeURIComponent(locale)}`,
    {
      method: "POST",
      headers: managementToken
        ? { "X-Reservation-Management-Token": managementToken }
        : undefined,
    },
  );
}
