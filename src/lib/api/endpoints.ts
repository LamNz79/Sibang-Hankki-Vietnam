const seg = encodeURIComponent;
export const apiEndpoints = {
  restaurants: "/api/restaurants",
  restaurant: (slug: string) => `/api/restaurants/${seg(slug)}`,
  availability: (slug: string) =>
    `/api/restaurants/${seg(slug)}/availability`,
  reservations: "/api/reservations",
  authCsrf: "/api/auth/csrf",
  authLogin: "/api/auth/login",
  authMe: "/api/auth/me",
  ownerReservations: "/api/owner/reservations",
  ownerReservation: (id: string) => `/api/owner/reservations/${seg(id)}`,
} as const;
