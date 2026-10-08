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
  customerReservationCheckInToken: (id: string) =>
    `/api/customer/reservations/${seg(id)}/check-in-token`,
  customerAccountReservations: "/api/customer/account/reservations",
  cancelCustomerAccountReservation: (id: string) =>
    `/api/customer/account/reservations/${seg(id)}/cancel`,
  customerAccountReservationCheckInToken: (id: string) =>
    `/api/customer/account/reservations/${seg(id)}/check-in-token`,
  authCsrf: "/api/auth/csrf",
  authLogin: "/api/auth/login",
  authRegister: "/api/auth/register",
  authLogout: "/api/auth/logout",
  authMe: "/api/auth/me",
  customerProfile: "/api/customer/profile",
  ownerReservations: "/api/owner/reservations",
  ownerSettings: "/api/owner/settings",
  ownerBusinessHours: "/api/owner/settings/business-hours",
  regenerateOwnerSlots: "/api/owner/settings/regenerate-slots",
  ownerMenu: "/api/owner/menu",
  ownerMenuCategories: "/api/owner/menu/categories",
  ownerMenuCategory: (id: string) => `/api/owner/menu/categories/${seg(id)}`,
  ownerMenuItems: "/api/owner/menu/items",
  ownerMenuItem: (id: string) => `/api/owner/menu/items/${seg(id)}`,
  ownerMedia: "/api/owner/media",
  ownerMediaItem: (id: string) => `/api/owner/media/${seg(id)}`,
  ownerReservation: (id: string) => `/api/owner/reservations/${seg(id)}`,
  confirmOwnerReservation: (id: string) =>
    `/api/owner/reservations/${seg(id)}/confirm`,
  declineOwnerReservation: (id: string) =>
    `/api/owner/reservations/${seg(id)}/decline`,
  ownerCheckIns: "/api/owner/check-ins",
} as const;
