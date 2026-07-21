# Sibang Hankki Vietnam Meeting Checklist

Date: 2026-07-20

Source files:
- `Viet_reserve_Plan_Doc_v0.1.docx`
- `Customer Web App Wireframe- Kor·Eng .docx`

## 1. Current understanding

- The near-term focus appears to be the customer-facing app first.
- The current wireframe mainly covers customer screens, not owner/admin screens.
- The current customer flow is:
  - Home
  - Restaurant List
  - Detailed Filters
  - Restaurant Details
  - Reservation
  - My Reservations

## 2. Main decisions to clarify in the meeting

### A. MVP boundary

- Is release 1 only the customer app?
- Does MVP stop at:
  - browse restaurants
  - filter/search
  - restaurant details
  - reservation creation
  - my reservations
- Or does MVP also include:
  - owner reservation handling
  - visit/check-in handling
  - deposit/payment
  - coupon/points

### B. Reservation confirmation

- After the customer submits a reservation, is it:
  - instantly confirmed
  - pending restaurant approval
  - configurable per restaurant

This affects:
- UX after booking
- reservation statuses
- notification logic
- owner workflow later

### C. Payment scope

- Is payment included in MVP?
- If yes, is it:
  - no payment, reservation only
  - deposit only
  - full payment
  - on-site payment support later

This affects:
- reservation flow
- payment states
- integration scope
- cancellation/refund policy

### D. Branch / table / availability model

- Does one restaurant have multiple branches from day 1?
- Is reservation made against:
  - restaurant
  - branch
  - time slot
  - specific table

This affects:
- DB design
- reservation logic
- availability API
- screen fields in detail/reservation pages

### E. Owner roles

- Even if owner/admin is not phase 1, should the backend prepare for:
  - owner only
  - owner + manager/staff
  - multiple permission levels

This affects:
- auth design
- future portal structure
- reservation management ownership

## 3. Feature review

## Looks correct for now

- Home
- Restaurant list
- Detailed filters
- Restaurant details
- Reservation
- My reservations

This is a clean MVP flow for a customer app.

## Features to confirm or add explicitly

- Branch selection
- Available time display
- Reservation status display
- Cancel reservation
- Reschedule reservation
- Guest request/note field
- Login timing before or after reservation
- Phone verification / OTP requirement
- Map/address handling

## 4. Screen review notes

### Home

- Confirm whether city/location entry is needed from the first screen.
- Confirm whether the main CTA is clear enough for booking.

### Restaurant List

- Confirm what each card must show:
  - image
  - cuisine/category
  - area
  - price range
  - rating/review summary
  - available reservation slot
  - promotion badge

### Detailed Filters

- Confirm which filters are truly MVP:
  - category/cuisine
  - location
  - group dining
  - price range
  - reservation available
  - open now

### Restaurant Details

- This is one of the most important screens.
- Confirm whether it includes:
  - basic info
  - branch info
  - address/map
  - menu preview
  - available times
  - reservation CTA

### Reservation

- Confirm required fields:
  - date
  - time
  - party size
  - customer name
  - phone number
  - request/note
- Confirm whether payment/deposit appears here.

### My Reservations

- Confirm status types:
  - pending
  - confirmed
  - cancelled
  - completed
  - no-show
- Confirm whether this screen includes:
  - cancel
  - reschedule
  - booking detail view

## 5. Areas that still feel unclear in the document

- Branch/table/slot model is not clearly defined yet.
- Reservation confirmation rule is not locked yet.
- Payment/deposit scope is not locked yet.
- Customer-side cancel/reschedule policy is not clear yet.
- Login/auth timing in the customer flow is not explicit yet.
- It is not fully clear whether owner/admin is only later scope or should be partly prepared in phase 1 backend.

## 6. Suggested meeting questions

1. Are we officially prioritizing the customer app first?
2. What is the exact MVP boundary for release 1?
3. Is reservation auto-confirmed or approval-based?
4. Is payment outside MVP, deposit-only, or part of MVP?
5. Are reservations made by restaurant, branch, or time slot?
6. Do we need branch support from day 1?
7. Does My Reservations include cancel/reschedule?
8. What filters must be supported in MVP?
9. Do we need owner/staff role planning now, even if owner app comes later?
10. Which features are explicitly phase 2:
    reviews, coupons, points, promotions, POS/KDS, full payment integrations?

## 7. My recommendation

- Keep phase 1 focused on the customer app.
- Lock these 3 decisions first:
  - reservation confirmation
  - payment scope
  - branch/availability model
- Treat owner/admin as future-facing scope unless the team explicitly wants backend preparation now.
