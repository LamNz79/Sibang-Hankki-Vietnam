import { describe, expect, it } from "vitest";
import { callWaitlistTicket, type WaitlistTicket } from "./waitlist";

const ticket: WaitlistTicket = {
  queueNumber: "W-042",
  partySize: 2,
  restaurantName: "Anan Saigon",
  restaurantSlug: "anan-saigon",
  status: "waiting",
};

describe("waitlist ticket transitions", () => {
  it("moves a waiting ticket to called without mutating the original", () => {
    const called = callWaitlistTicket(ticket);

    expect(ticket.status).toBe("waiting");
    expect(called.status).toBe("called");
    expect(called.queueNumber).toBe(ticket.queueNumber);
  });
});
