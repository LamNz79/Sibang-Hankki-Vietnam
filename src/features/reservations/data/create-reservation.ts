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
  createdAt: string;
};

export async function createReservation(
  input: CreateReservationInput,
): Promise<CreateReservationResponse> {
  const { idempotencyKey, ...body } = input;
  const response = await fetch("/api/reservations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message =
      response.status === 409
        ? "This time is no longer available. Please choose another time."
        : "Unable to create the reservation. Please try again.";
    throw new Error(message);
  }

  return response.json();
}
