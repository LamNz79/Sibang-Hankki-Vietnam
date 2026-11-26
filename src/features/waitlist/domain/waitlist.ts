export type WaitlistStatus = "waiting" | "called";

export type WaitlistTicket = {
  queueNumber: string;
  partySize: number;
  restaurantName: string;
  restaurantSlug: string;
  status: WaitlistStatus;
};

export function callWaitlistTicket(ticket: WaitlistTicket): WaitlistTicket {
  return { ...ticket, status: "called" };
}
