# Sibang Hankki — Quick System Guide

## 1. System overview

Sibang Hankki is a restaurant discovery, reservation, and guest check-in system. It currently supports four workspaces:

| Workspace | Main users | Purpose |
| --- | --- | --- |
| Customer | Restaurant guests | Find restaurants, make reservations, and track personal bookings |
| Owner | Restaurant owner or front-of-house staff | Handle daily reservations and guest arrivals on a mobile-friendly screen |
| Restaurant Admin | Restaurant management team | Manage reservations, menus, photos, customers, and restaurant operations on desktop |
| System Admin | Platform operator | Manage all users, restaurants, access assignments, and reservations |

Use **Switch workspace** in the application to move between the workspaces available to the signed-in account.

## 2. Customer flow

Customers may browse restaurants and submit a reservation without signing in. Creating an account is recommended because it allows the customer to manage reservations across devices.

1. Open the home page and select a restaurant.
2. Review its profile, photos, opening information, available menu, and price range.
3. Select **Select date & time**.
4. Choose the date, party size, and an available time.
5. Enter the guest's contact information and submit the request.
6. Open **My reservations** to view the booking status.

The result depends on the restaurant's confirmation policy:

- **Automatic:** the reservation is confirmed immediately.
- **Manual:** the restaurant must accept the request.
- **Hybrid:** smaller parties are confirmed automatically; larger parties require restaurant approval.

For a confirmed reservation, the customer can open the reservation and show its QR code at the restaurant. The page updates as the visit moves through **Checked in**, **Seated**, and **Completed**.

If the restaurant suggests another time, the customer can accept it, request another time, or decline. A customer may cancel before the restaurant's configured cancellation cutoff.

## 3. Owner operations

The Owner workspace is designed for daily mobile operation. An owner or staff account only sees the restaurant assigned to that account.

### Handle reservation requests

1. Open **Today** or the reservation list.
2. Select a reservation.
3. For a pending request, choose one of the available actions:
   - confirm the requested time;
   - suggest another available time; or
   - decline the request with a reason.
4. Call the guest only when direct follow-up is necessary.

### Check in a guest

1. Open **Check-in**.
2. Scan the customer's QR code, or use **Manual lookup** to search by booking reference, guest name, or phone number.
3. Review the reservation and select **Check in**.
4. From the guest-arrival page, move the visit through **Arrived → Seated → Completed**.

Visit states move forward and are not intended to be reversed. **No-show** becomes available only after the reservation time plus the configured grace period.

### Configure booking availability

Open **Settings** to manage:

- restaurant profile information;
- automatic, manual, or hybrid confirmation;
- guest capacity and party-size limits;
- booking window, slot interval, and dining duration;
- cancellation cutoff and no-show grace period; and
- business hours.

Saving business hours regenerates future booking slots automatically. After changing capacity, booking window, slot interval, or dining duration, select **Regenerate future slots**. Existing reservations are preserved.

## 4. Restaurant Admin workspace

The Restaurant Admin workspace provides a wider desktop view for the restaurant management team.

Core operational pages include:

- **Dashboard:** today's reservation totals and pending requests.
- **Reservations:** search and filter reservations, inspect details, and review booking/visit status.
- **Customers:** review guests and their reservation history.
- **Menu:** create categories and dishes, set prices and images, and control whether a dish is publicly available.
- **Photos:** add, edit, order, or remove restaurant photos. The lowest display order is used as the primary image.
- **Settings:** review restaurant access and operating configuration.

Menu items marked unavailable are retained for management but hidden from the public restaurant page.

## 5. System Admin workspace

The System Admin workspace is for platform-wide management and is separate from the restaurant's own admin area.

### Users

- Create and edit user accounts.
- Search or filter users by role and status.
- Suspend or reactivate an account.

### Restaurants

- Create and edit restaurant profiles.
- Manage booking settings, business hours, menus, and photos from the restaurant detail page.
- Move a restaurant through the approval flow:
  **Draft → Pending → Active**.
- Request changes, suspend/reactivate an active restaurant, or archive a draft restaurant.

Only active, non-archived restaurants are visible to customers.

### Restaurant access

Use **Restaurant access** to link an active user to a restaurant as **Owner** or **Staff**. Each restaurant account is scoped to its assigned restaurant. Removing the assignment removes restaurant-management access from that account.

### Reservations

System Admin can view reservations across all restaurants, then filter by restaurant, status, date, or customer information. Restaurant owners and staff only manage reservations belonging to their assigned restaurant.

## 6. Recommended end-to-end check

Use one active test restaurant for the complete acceptance flow:

1. System Admin creates or activates the restaurant and assigns an owner.
2. System Admin or Restaurant Admin adds business hours, regenerates slots, creates an available menu item, and adds a restaurant photo.
3. A customer opens the public restaurant page and creates a reservation.
4. The owner confirms it when manual confirmation is required.
5. The customer opens the confirmed booking QR code.
6. The owner scans the QR code or checks in the guest manually.
7. The owner updates the visit to **Seated** and then **Completed**.
8. System Admin verifies the final reservation and visit status.

## 7. Current usage notes

- Customer change/reschedule requests are not yet part of the completed core flow.
- Some marketing and analytics pages are still secondary to the reservation acceptance flow.
- Do not share System Admin credentials with restaurant teams.
- Use test accounts and test reservations when demonstrating status changes because terminal states are intentionally not reversible.
