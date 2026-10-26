# Sibang Hankki — MVP Feature Summary

**Last updated:** October 22, 2026  
**Scope:** Customer, Owner/Staff, Restaurant Admin, and System Admin  
**MVP objective:** Complete the end-to-end flow from restaurant setup and booking availability to customer reservations, restaurant handling, guest check-in, and platform-wide status tracking.

## 1. User roles and workspaces

| Workspace | Primary users | Data scope |
| --- | --- | --- |
| Customer | Registered customers and guests | Public restaurants and the customer's own reservations |
| Owner | Restaurant owners and front-of-house staff | The restaurant assigned to the account |
| Restaurant Admin | Restaurant management teams | The restaurant assigned to the account, with a desktop interface |
| System Admin | Platform operators | All users, restaurants, access assignments, and reservations |

The application includes a workspace switcher that directs each account to the workspaces allowed by its role.

## 2. Accounts, authentication, and authorization

Implemented features:

- Customer registration.
- Session-based login and logout.
- Retrieval of the currently authenticated user.
- Self-service password change.
- System Admin password reset for non-ADMIN accounts.
- Customer profile editing for name, email, and phone number.
- Vietnamese, English, and Korean localization in supported areas.
- Role-protected routes:
  - only OWNER or STAFF can access restaurant workspaces;
  - only ADMIN can access System Admin;
  - unauthenticated users are redirected to login when opening protected pages.
- CSRF protection for state-changing requests.
- User identity is taken from the authenticated session instead of trusting a browser-supplied `userId` or `restaurantId`.
- OWNER and STAFF accounts are restricted to their assigned restaurant.
- System Admin can suspend and reactivate accounts.

## 3. Customer — Restaurant discovery and reservations

### 3.1. Restaurant discovery

- Public home page and restaurant directory.
- Only active, non-archived restaurants are publicly visible.
- Location filters by province/city and ward/commune/special zone.
- Administrative locations are retrieved through the backend proxy instead of being hard-coded in the frontend.
- Restaurant detail page containing:
  - name, description, cuisine, and price range;
  - address and contact information;
  - a multi-image gallery;
  - a primary image selected by display order;
  - available menu categories and dishes.
- Signed-in customers can save and remove favorite restaurants.
- A dedicated page lists saved restaurants.

### 3.2. Creating a reservation

- Guests can create reservations without signing in.
- Signed-in customers can create reservations and manage them across devices.
- Selection of date, party size, and an available start time.
- Availability is loaded from the backend by restaurant, date, and party size.
- The page clearly indicates when restaurant confirmation is required.
- Guest name, phone number, email, and special requests are supported.
- Customers can select menu items and quantities for pre-order and add a pre-order note.
- Idempotency keys protect reservation creation from accidental duplicate submissions.
- The initial result follows the restaurant's confirmation policy:
  - **AUTO:** confirmation is immediate;
  - **MANUAL:** the restaurant must respond;
  - **HYBRID:** confirmation depends on party size.

### 3.3. Managing customer reservations

- Signed-in customers only see reservations linked to their own account.
- Guests only see reservations associated with management tokens stored in their browser.
- Reservation details include:
  - booking reference;
  - restaurant, date, time, and party size;
  - pre-order and special requests;
  - reservation and visit statuses.
- Customers can cancel within the restaurant's cancellation policy.
- Customers can submit a date/time change request.
- When the restaurant proposes another time, the customer can:
  - accept it;
  - decline it; or
  - request another time.
- Previous proposal notices are removed when a newer outcome supersedes them.
- Confirmed reservations include a QR check-in code.
- Customer-facing visit status updates through confirmed, arrived, seated, completed, or no-show.
- Reservation cards and details link back to the restaurant and display its image when available.

## 4. Owner/Staff — Restaurant operations

### 4.1. Daily operations dashboard

- Owners and staff only see reservations belonging to their assigned restaurant.
- Reservation lists can be viewed by date and status.
- Search by booking reference, guest name, or contact details.
- Pagination and selectable page size.
- Summary counts for confirmed, checked-in, cancelled, and no-show reservations.
- Direct creation of walk-in reservations.

### 4.2. Handling reservation requests

- Full guest and service-request details.
- Confirm a pending request.
- Decline a request with a reason.
- Propose another date/time with a message.
- Review the customer's response to a proposal.
- Accept or decline a change request submitted by the customer.
- Cancel a confirmed reservation when the business rules allow it.
- Call the guest from the stored phone number.
- Terminal reservation states and visit states cannot be arbitrarily reversed, preserving a reliable history.

### 4.3. Guest arrival and check-in

- Scan the customer's QR code.
- Manual check-in when QR scanning is unavailable.
- Manual lookup by reference, guest name, or phone number.
- Validate reservation status and time eligibility before check-in.
- Advance the visit through:
  **EXPECTED → ARRIVED → SEATED → COMPLETED**.
- Mark a reservation as **NO_SHOW** after its start time plus the configured grace period.
- Owner and Customer views reflect the same current visit status.

### 4.4. Restaurant customer history

- Build the customer list from real reservation history.
- Search by name, phone number, or email.
- Display reservation count, visit count, no-show count, and latest reservation.

### 4.5. Booking configuration

- Edit restaurant profile information.
- Configure AUTO, MANUAL, or HYBRID confirmation.
- Configure the party-size threshold for manual confirmation.
- Configure:
  - guest capacity;
  - booking window;
  - slot interval;
  - dining duration;
  - minimum and maximum online party sizes;
  - large-party threshold;
  - cancellation cutoff;
  - no-show grace period.
- Configure multiple business-hour periods for each day of the week.
- Saving business hours automatically regenerates future slots.
- Future slots can be regenerated explicitly after changing availability-related settings.
- Slot regeneration preserves existing reservations.
- An in-product guide explains slot-generation behavior for first-time users.

## 5. Restaurant Admin — Desktop restaurant management

This workspace uses the same restaurant scope as Owner/Staff but is optimized for desktop management.

### 5.1. Dashboard and reservations

- Dashboard metrics derived from the restaurant's real reservation data:
  - today's reservations;
  - checked-in guests;
  - pending requests;
  - no-shows;
  - seven-day trend;
  - reservations requiring attention.
- Reservation search, status filters, date-period filters, and pagination.
- Reservation details expose valid actions for the current state, including confirmation, check-in, seating, completion, cancellation, and no-show.

### 5.2. Customers

- Customer records are derived from real restaurant reservations.
- Search and pagination.
- Reservation count, visit count, no-show count, and most recent reservation.

### 5.3. Menu management

- View menu items grouped by category.
- Create, update, and delete categories.
- Configure category display order.
- Create, update, and delete menu items.
- Manage item name, description, price, currency, and image URL.
- Set whether an item is currently available.
- Unavailable items remain visible to management but are hidden from customers.
- Categories containing menu items cannot be deleted.

### 5.4. Restaurant media

- Create, update, and delete restaurant images by URL.
- Manage image alt text for accessibility.
- Manage image display order.
- The lowest display order is used as the primary restaurant image.
- Customers can view the complete restaurant gallery.

### 5.5. Settings

- Reuses the restaurant profile, booking policy, and business-hour configuration available to Owner.
- Supports future slot regeneration from the desktop interface.

## 6. System Admin — Platform-wide administration

### 6.1. Overview

- Total users, restaurants, active restaurants, and restaurant access assignments.
- Restaurants awaiting review.
- Quick links to the primary administration areas.

### 6.2. User management

- Search and filter users by role and status.
- Pagination and selectable page size.
- Create a new customer account.
- Edit name, email, and phone number.
- Reset passwords for non-ADMIN accounts.
- Suspend and reactivate accounts.
- Suspending an account invalidates its active session and prevents login until reactivation.

### 6.3. Restaurant management

- Search and filter restaurants by status and province/city.
- Create restaurants as drafts.
- Edit the complete restaurant profile.
- Select cuisine from a user-facing list instead of entering technical codes.
- Select province/city and ward/commune from the location API.
- Manage address, contact details, timezone, and price range.
- Restaurant approval lifecycle:
  **DRAFT → PENDING → ACTIVE**.
- Request changes and resubmit for review.
- Suspend and reactivate restaurants.
- Archive an unused draft restaurant when it has no linked accounts or reservations.
- From the restaurant detail page, System Admin can manage:
  - profile;
  - booking settings;
  - business hours;
  - menu;
  - media;
  - slot regeneration.

### 6.4. Restaurant access assignments

- A dedicated page links users to restaurants.
- Assign OWNER or STAFF roles.
- Search and filter access assignments.
- Change an assignment's role or restaurant.
- Remove an assignment and return the account to the CUSTOMER role.
- In the MVP, each restaurant-management account can be assigned to one restaurant.

### 6.5. Platform-wide reservation visibility

- View reservations across all restaurants.
- Filter by restaurant, status, and date range.
- Search by booking reference, customer, phone number, or email.
- Pagination and selectable page size.
- View guest, restaurant, schedule, request, proposal, reservation status, and visit status details.
- Long booking references remain responsive and do not break the table layout.
- OWNER and STAFF accounts remain limited to their assigned restaurant.

### 6.6. System Admin personal preferences

- Preferences are stored per authenticated account.
- Choose a theme color from presets or enter a `#RRGGBB` HEX value.
- Preview the color before saving; primary actions automatically use readable contrast.
- Choose Comfortable or Compact display density.
- Choose a default table page size of 10, 20, or 50.
- Choose DD/MM/YYYY or MM/DD/YYYY date formatting.
- Choose Vietnamese or English and synchronize it with the account preference.
- Restore all preferences to their defaults.

## 7. Reservation lifecycle in the MVP

### Reservation request status

```text
PENDING
  ├─ CONFIRMED
  ├─ ALTERNATIVE_PROPOSED → CONFIRMED / PENDING / DECLINED
  ├─ DECLINED
  ├─ CANCELLED
  └─ EXPIRED
```

### Visit status

```text
EXPECTED → ARRIVED → SEATED → COMPLETED
    └────→ NO_SHOW
```

The backend validates every important transition. Completed and terminal states cannot be freely moved backward.

## 8. Data integrity, reliability, and deployment

- PostgreSQL stores users, restaurants, settings, slots, reservations, events, menus, media, and account preferences.
- Flyway automatically applies database migrations when the backend starts or a new version is deployed.
- Reservation and visit states are reloaded from the backend rather than existing only in frontend memory.
- Backend rules enforce availability, capacity, booking limits, and valid state transitions.
- Optimistic locking and idempotency protect important reservation operations.
- Large administrative lists use backend pagination and filtering.
- The frontend provides responsive mobile layouts for Customer/Owner and desktop layouts for administration.
- Unit and integration tests cover API adapters, business rules, reservation transitions, CRUD operations, and important UI helpers.
- Backend and frontend build/deployment scripts, a systemd service, and a health check are available for Ubuntu/AWS deployment.

## 9. Supported end-to-end demonstration flow

1. System Admin creates a restaurant.
2. System Admin completes its profile, menu, media, booking settings, and business hours.
3. System Admin submits and activates the restaurant.
4. System Admin creates or assigns an OWNER/STAFF account.
5. Owner generates future booking slots from the configuration.
6. Customer discovers the restaurant, selects menu items, and creates a reservation.
7. Owner confirms the request or proposes another time when required.
8. Customer responds to the proposal and receives a QR code after confirmation.
9. Owner scans the QR code or performs manual check-in.
10. Owner advances the visit to Seated and Completed.
11. Customer and System Admin can both verify the final status.

## 10. Screens that are not complete MVP features

The following screens exist as product-direction prototypes but currently use demonstration data or do not have complete backend workflows:

- Owner Marketing and campaign creation.
- Restaurant Admin Campaigns.
- Restaurant Admin Stores as a multi-branch directory.
- Revenue, commission, settlement, and revenue report export.
- Customer dining map.
- Physical table assignment for reservations.
- Online payment, refunds, and settlement.
- Real email, SMS, or push-notification delivery.
- Direct image-file upload to object storage; the MVP currently manages images by URL.
- Dark mode and theme customization for Owner/Customer; personal preference UI is currently limited to System Admin.

These items should not be presented as completed functionality during the current MVP acceptance review.

## 11. Current MVP completion criterion

The MVP meets its core objective when one test restaurant can complete the following flow using persisted data:

- create and activate a restaurant;
- assign a restaurant-management account;
- configure hours, slots, menu, and media;
- receive a Customer reservation;
- confirm it or negotiate another time;
- issue and scan a QR code;
- complete the guest visit;
- verify the resulting history from Customer, Owner, and System Admin views.

