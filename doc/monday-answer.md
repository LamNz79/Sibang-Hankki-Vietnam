# Monday Meeting Decisions

**Date:** 2026-09-28

## Confirmed decisions

### Capacity

- Capacity is measured by guest count in v1.
- Each restaurant configures its own guest capacity.
- A reservation consumes capacity equal to its `party_size`.
- Pending requests do not consume capacity. Only confirmed reservations consume capacity.
- Capacity must be checked again atomically when a request is confirmed or rescheduled.
- An owner may explicitly accept an over-capacity request or decline it. A decline sends a notification to the customer.

### Restaurant booking settings

Each restaurant can configure:

- Guest capacity.
- Dining duration in minutes.
- Checkout hold duration in minutes.
- Pending confirmation expiry in minutes.
- Confirmation mode.

Confirmation mode has three options:

- `AUTO`: a valid request is confirmed immediately when capacity is available.
- `MANUAL`: every request remains pending until restaurant staff confirms or declines it.
- `HYBRID`: requests below a configured party-size threshold are confirmed automatically; larger requests require manual confirmation.

Values use explicit typed fields with validation, not an unrestricted generic settings object.

### Availability and pending requests

- Requests are received in order.
- A pending request does not reserve capacity.
- If capacity is no longer available when staff reviews a pending request, staff can decline it, suggest another time, or explicitly approve it as an over-capacity booking.
- Cancelling a confirmed reservation releases its capacity.
- When a slot is full, the system blocks automatic confirmation and may suggest another time.
- Both the customer and restaurant are notified when a reservation is confirmed.

### Duplicate and overlapping reservations

- Duplicate or overlapping reservations are not automatically cancelled.
- The customer and restaurant can use the reservation chat to agree on the required change.
- The exact warning or duplicate-detection rule remains an implementation decision.

### Rescheduling

- The owner can discuss a change with the customer through reservation chat and update the existing reservation.
- Changing the date, time, dining duration, or party size must recheck capacity.
- Releasing the old capacity, reserving the new capacity, updating the reservation, and writing its audit event occur in one database transaction.
- Previous values remain available through reservation history; the old reservation row is not deleted.

### Unexpected closure

- The system identifies affected upcoming reservations and notifies their customers.
- The owner can discuss a replacement date/time with the customer or cancel the reservation.
- This applies to same-day and future closures, not only next-day reservations.

## Still to define

- Allowed minimum and maximum values and initial defaults for each restaurant setting.
- Which roles may approve an over-capacity reservation.
- Whether over-capacity approval requires a reason.
- Chat retention, notification delivery channels, and read-status behavior.
- Whether the customer must explicitly approve every owner-initiated reschedule before it becomes effective.
