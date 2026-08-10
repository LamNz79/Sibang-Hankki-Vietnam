export enum ReservationStatus {
  Pending = "pending",
  AlternativeProposed = "alternative-proposed",
  Confirmed = "confirmed",
  Declined = "declined",
}

export enum VisitStatus {
  Expected = "expected",
  Arrived = "arrived",
  Seated = "seated",
  Completed = "completed",
}

export enum ReservationCustomerAction {
  AcceptedAlternative = "accepted-alternative",
  DeclinedAlternative = "declined-alternative",
  RequestedAnotherTime = "requested-another-time",
}

export type ReservationDisplayStatus = ReservationStatus | VisitStatus;
