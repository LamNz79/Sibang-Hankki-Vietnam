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

export type ReservationDisplayStatus = ReservationStatus | VisitStatus;
