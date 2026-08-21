/** Temporary prototype threshold until restaurants can configure party sizes. */
export const LARGE_PARTY_THRESHOLD = 10;

/** Lifecycle of a reservation request before the guest arrives. */
export enum ReservationStatus {
  Pending = "pending",
  AlternativeProposed = "alternative-proposed",
  Confirmed = "confirmed",
  Declined = "declined",
}

/** Operational visit lifecycle managed by restaurant staff. */
export enum VisitStatus {
  Expected = "expected",
  Arrived = "arrived",
  Seated = "seated",
  Completed = "completed",
}

/** Last explicit response made by the customer during a time-change flow. */
export enum ReservationCustomerAction {
  AcceptedAlternative = "accepted-alternative",
  DeclinedAlternative = "declined-alternative",
  RequestedAnotherTime = "requested-another-time",
}

/** Status value shown in owner-facing reservation lists. */
export type ReservationDisplayStatus = ReservationStatus | VisitStatus;

/** Alternative date and time proposed by the restaurant. */
export interface CustomerAlternativeProposal {
  date: string;
  time: string;
  message?: string;
  proposedAt: string;
  respondBy?: string;
}

/** Customer-facing reservation record currently persisted by the prototype. */
export interface CustomerReservation {
  id: string;
  restaurantSlug: string;
  restaurantName: string;
  district: string;
  cuisineLabel: string;
  date: string;
  time: string;
  guests: number;
  status: ReservationStatus;
  reference?: string;
  alternativeProposal?: CustomerAlternativeProposal;
  previousDate?: string;
  previousTime?: string;
  preOrder?: string;
  specialRequest?: string;
  customerAction?: ReservationCustomerAction;
  createdAt: string;
  updatedAt?: string;
}

/** Minimum information required to create or resubmit a reservation request. */
export type ReservationRequestInput = Pick<
  CustomerReservation,
  | "id"
  | "restaurantSlug"
  | "restaurantName"
  | "district"
  | "cuisineLabel"
  | "date"
  | "time"
  | "guests"
>;

/** Information required for the restaurant to propose another booking slot. */
export type AlternativeProposalInput = Pick<
  CustomerReservation,
  | "id"
  | "restaurantSlug"
  | "restaurantName"
  | "district"
  | "cuisineLabel"
  | "date"
  | "time"
  | "guests"
  | "reference"
  | "preOrder"
  | "specialRequest"
> & {
  proposedDate: string;
  proposedTime: string;
  message?: string;
  respondBy?: string;
};
