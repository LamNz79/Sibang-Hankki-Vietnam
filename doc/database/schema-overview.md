# Sibang Hankki Database Overview

This diagram is a simplified view of `unified-schema.dbml`. The DBML describes the agreed target model; Flyway migrations remain the source of truth for the deployed schema.

```mermaid
flowchart LR
  subgraph Identity["Identity & Access"]
    direction TB
    users["users<br/>Unique userid + role + restaurant scope<br/>ACTIVE / SUSPENDED / CLOSED"]
  end

  subgraph Store["Store Management"]
    direction LR
    restaurants["restaurants<br/>Store profile and approval status"]
    approval_events["store_approval_events<br/>Approval audit history"]

    subgraph StoreConfig["Store Configuration"]
      direction TB
      booking_settings["booking_settings"]
      business_hours["business_hours"]
      schedule_exceptions["schedule_exceptions"]
    end

    restaurants -->|"1 : N"| approval_events
    restaurants -->|"1 : 1"| booking_settings
    restaurants -->|"1 : N"| business_hours
    restaurants -->|"1 : N"| schedule_exceptions
  end

  subgraph Booking["Availability & Reservations"]
    direction LR
    booking_slots["booking_slots<br/>Capacity by time and party bucket"]
    reservations["reservations<br/>Request and visit state"]
    proposals["reservation_proposals<br/>Alternative slot, time, or party size"]
    reservation_events["reservation_events<br/>Reservation audit history"]

    booking_slots -->|"optional slot"| reservations
    reservations --> proposals
    reservations --> reservation_events
  end

  users ==>|"OWNER / STAFF via restaurant_id"| restaurants
  restaurants ==>|"publishes capacity"| booking_slots
  restaurants -->|"receives"| reservations

  classDef identity fill:#e8f1ff,stroke:#3973ac,color:#16324f;
  classDef store fill:#fff1dd,stroke:#c77700,color:#5f3900;
  classDef booking fill:#e8f7ee,stroke:#37865a,color:#173e2a;

  class users identity;
  class restaurants,approval_events,booking_settings,business_hours,schedule_exceptions store;
  class booking_slots,reservations,proposals,reservation_events booking;
```

Legend:

- Solid arrows represent core ownership relationships.
- Thick arrows represent the primary store-to-booking flow.
- Actor/customer foreign keys are intentionally hidden here to prevent crossing lines; they remain visible in `unified-schema.dbml`.

## Authorization model

| Check | Purpose |
| --- | --- |
| `users.status = ACTIVE` | Account may authenticate and perform actions. Account status overrides every role. |
| `users.role` | Grants the CUSTOMER, OWNER, STAFF, or ADMIN role. |
| `users.restaurant_id` | Scopes OWNER/STAFF actions to one restaurant and is required for those roles. |
| Resource attributes | Backend checks ownership, restaurant status, reservation status, and allowed transition for every request. |

Frontend visibility is not authorization. Every backend endpoint must apply these checks and deny by default.

## V1 capacity rule

- Capacity is measured in guests and configured independently by each restaurant.
- `capacity_total` is the number of guests supported for an interval; `capacity_reserved` is the sum of `party_size` for confirmed reservations occupying that interval.
- Dining duration, checkout hold, pending expiry, and confirmation mode are restaurant settings.
- Confirmation mode is `AUTO`, `MANUAL`, or `HYBRID`; hybrid mode also configures the minimum party size requiring manual confirmation.
- A pending reservation does not reserve capacity.
- Confirming a reservation rechecks capacity and increments `capacity_reserved` by `party_size` atomically.
- Normal confirmation cannot exceed `capacity_total`. An authorized restaurant member may explicitly override capacity; the reservation is marked and the actor is recorded in the audit event.
- Confirmed cancellation releases the reservation's `party_size` exactly once.
- Owner rescheduling releases old capacity and reserves new capacity in the same transaction while preserving an audit event.
- Accepting a proposal locks the affected slot rows, updates old/new capacity, updates the reservation, and marks the proposal accepted in one transaction.
- If any step fails, the transaction rolls back and the previous reservation remains unchanged.

## Retention and deletion

- Users are closed through `users.status`; referenced users are not hard-deleted.
- Restaurant access is revoked by suspending/closing the account or changing its direct `users.restaurant_id` scope; V1 has no membership-history table.
- Reservations are cancelled through status transitions and are never deleted as part of the normal workflow.
- Approval and reservation events are append-only audit records.

## Required PostgreSQL constraints

The future migration must enforce these rules in SQL, not only in Java:

- Positive party sizes, slot duration, booking window, cutoffs, and grace periods.
- `day_of_week` between 1 and 7 and valid opening/closing ranges.
- `capacity_total >= 0` and `capacity_reserved >= 0`; exceeding total capacity is allowed only through the explicit audited override workflow.
- Closed schedule exceptions have no opening range; open exceptions have both opening and closing times.
- At most one `PENDING` proposal per reservation, implemented as a partial unique index.
- Unique reservation creation `idempotency_key` and unique non-null event `command_id`.
- Foreign-key deletion uses `RESTRICT` for reservation/audit history; normal deletion is represented by status or revocation fields.

## Screen and API mapping

| Client action | Backend responsibility | Main tables |
| --- | --- | --- |
| Customer submits reservation | Validate active account/store/slot and create idempotently | `reservations`, `reservation_events` |
| Owner confirms or declines | Validate active account, direct restaurant scope, and allowed transition | `reservations`, `booking_slots`, `reservation_events` |
| Owner proposes an alternative | Store proposed slot/time/party size without overwriting history | `reservation_proposals`, `reservation_events` |
| Customer accepts proposal | Recheck capacity and apply proposal atomically | `reservation_proposals`, `reservations`, `booking_slots`, `reservation_events` |
| Customer or owner cancels | Check actor and cutoff, release confirmed capacity once | `reservations`, `booking_slots`, `reservation_events` |
| Owner checks in guest | Validate token and direct restaurant scope, then transition once | `reservations`, `reservation_events` |
| Admin approves/suspends store | Validate admin role and append approval decision | `restaurants`, `store_approval_events` |

## Items still requiring business confirmation

- Default values and allowed bounds for restaurant capacity and timing settings.
- Chat persistence, retention, and notification requirements.
- Whether owner-initiated rescheduling requires explicit customer acceptance.
- Whether a proposal may change party size as well as date/time.
- Expected handling for party sizes above `maximum_online_party_size` but not above `large_party_threshold`.
- Data-retention duration for closed accounts and old reservations.
- Whether a reissued QR token should invalidate the previous token immediately.
