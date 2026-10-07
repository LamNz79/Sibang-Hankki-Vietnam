import { ApiError, apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

export type CreateReservationInput = {
  idempotencyKey: string;
  restaurantSlug: string;
  date: string;
  time: string;
  partySize: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  specialRequest?: string;
  preOrderNote?: string;
};

export type CreateReservationResponse = {
  id: string;
  reference: string;
  restaurantSlug: string;
  date: string;
  time: string;
  partySize: number;
  status: "PENDING" | "CONFIRMED";
  requiresRestaurantConfirmation: boolean;
  managementToken?: string | null;
  createdAt: string;
};

export async function createReservation(
  input: CreateReservationInput,
): Promise<CreateReservationResponse> {
  const { idempotencyKey, ...body } = input;

  try {
    return await apiFetch<CreateReservationResponse>(
      apiEndpoints.reservations,
      {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        body: JSON.stringify(body),
      },
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      throw new Error("This time is no longer available. Please choose another time.");
    }
    throw new Error("Unable to create the reservation. Please try again.");
  }
}
