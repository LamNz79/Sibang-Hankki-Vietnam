const seg = encodeURIComponent;
export const apiEndpoints = {
  restaurants: "/api/restaurants",
  restaurant: (slug: string) => `/api/restaurants/${seg(slug)}`,
  availability: (slug: string) =>
    `/api/restaurants/${seg(slug)}/availability`,
  reservations: "/api/reservations",
  customerReservation: (id: string) =>
    `/api/customer/reservations/${seg(id)}`,
  cancelCustomerReservation: (id: string) =>
    `/api/customer/reservations/${seg(id)}/cancel`,
  authCsrf: "/api/auth/csrf",
  authLogin: "/api/auth/login",
  authMe: "/api/auth/me",
  ownerReservations: "/api/owner/reservations",
  ownerSettings: "/api/owner/settings",
  ownerBusinessHours: "/api/owner/settings/business-hours",
  regenerateOwnerSlots: "/api/owner/settings/regenerate-slots",
  ownerReservation: (id: string) => `/api/owner/reservations/${seg(id)}`,
  confirmOwnerReservation: (id: string) =>
    `/api/owner/reservations/${seg(id)}/confirm`,
  declineOwnerReservation: (id: string) =>
    `/api/owner/reservations/${seg(id)}/decline`,
} as const;
