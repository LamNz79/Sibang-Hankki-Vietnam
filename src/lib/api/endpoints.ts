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
  respondToCustomerReservationProposal: (
    id: string,
    proposalId: string,
    action: "accept" | "decline",
  ) =>
    `/api/customer/reservations/${seg(id)}/proposals/${seg(proposalId)}/${action}`,
  customerReservationCheckInToken: (id: string) =>
    `/api/customer/reservations/${seg(id)}/check-in-token`,
  customerAccountReservations: "/api/customer/account/reservations",
  cancelCustomerAccountReservation: (id: string) =>
    `/api/customer/account/reservations/${seg(id)}/cancel`,
  customerAccountReservation: (id: string) =>
    `/api/customer/account/reservations/${seg(id)}`,
  respondToCustomerAccountReservationProposal: (
    id: string,
    proposalId: string,
    action: "accept" | "decline",
  ) =>
    `/api/customer/account/reservations/${seg(id)}/proposals/${seg(proposalId)}/${action}`,
  customerAccountReservationCheckInToken: (id: string) =>
    `/api/customer/account/reservations/${seg(id)}/check-in-token`,
  authCsrf: "/api/auth/csrf",
  authLogin: "/api/auth/login",
  authRegister: "/api/auth/register",
  authLogout: "/api/auth/logout",
  authMe: "/api/auth/me",
  customerProfile: "/api/customer/profile",
  ownerReservations: "/api/owner/reservations",
  ownerWalkIns: "/api/owner/reservations/walk-ins",
  ownerReservationsPaged: "/api/owner/reservations/paged",
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
  ownerReservationProposals: (id: string) =>
    `/api/owner/reservations/${seg(id)}/proposals`,
  confirmOwnerReservation: (id: string) =>
    `/api/owner/reservations/${seg(id)}/confirm`,
  declineOwnerReservation: (id: string) =>
    `/api/owner/reservations/${seg(id)}/decline`,
  cancelOwnerReservation: (id: string) =>
    `/api/owner/reservations/${seg(id)}/cancel`,
  markNoShowOwnerReservation: (id: string) =>
    `/api/owner/reservations/${seg(id)}/no-show`,
  checkInOwnerReservation: (id: string) =>
    `/api/owner/reservations/${seg(id)}/check-in`,
  seatOwnerReservation: (id: string) =>
    `/api/owner/reservations/${seg(id)}/seat`,
  completeOwnerReservation: (id: string) =>
    `/api/owner/reservations/${seg(id)}/complete`,
  ownerCheckIns: "/api/owner/check-ins",
  systemAdminUsers: "/api/admin/users",
  systemAdminRestaurants: "/api/admin/restaurants",
  systemAdminRestaurantAssignments: "/api/admin/restaurant-assignments",
  systemAdminRestaurantAssignment: (userId: string) =>
    `/api/admin/restaurant-assignments/${seg(userId)}`,
  systemAdminRestaurant: (id: string) =>
    `/api/admin/restaurants/${seg(id)}`,
  locationProvinces: "/api/locations/provinces",
  locationWards: (provinceCode: number) =>
    `/api/locations/provinces/${provinceCode}/wards`,
  systemAdminUserStatus: (id: string) =>
    `/api/admin/users/${seg(id)}/status`,
  systemAdminRestaurantStatus: (id: string) =>
    `/api/admin/restaurants/${seg(id)}/status`,
} as const;
