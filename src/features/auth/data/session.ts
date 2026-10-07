import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

export type CsrfToken = {
  headerName: string;
  parameterName: string;
  token: string;
};

export type SessionUser = {
  id: string;
  userid: string;
  role: "CUSTOMER" | "OWNER" | "STAFF" | "ADMIN";
  restaurantId: string | null;
};

export type CustomerRegistration = {
  userid: string;
  email: string;
  name: string;
  password: string;
};

export type RegisteredCustomer = Omit<CustomerRegistration, "password"> & {
  id: string;
  role: "CUSTOMER";
};

export function getCsrfToken() {
  return apiFetch<CsrfToken>(apiEndpoints.authCsrf, { cache: "no-store" });
}

export async function login(userid: string, password: string) {
  const csrf = await getCsrfToken();

  await apiFetch<void>(apiEndpoints.authLogin, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      [csrf.headerName]: csrf.token,
    },
    body: new URLSearchParams({ userid, password }),
  });

  return apiFetch<SessionUser>(apiEndpoints.authMe, { cache: "no-store" });
}

export async function registerCustomer(registration: CustomerRegistration) {
  const csrf = await getCsrfToken();

  return apiFetch<RegisteredCustomer>(apiEndpoints.authRegister, {
    method: "POST",
    headers: { [csrf.headerName]: csrf.token },
    body: JSON.stringify(registration),
  });
}

export async function logout() {
  const csrf = await getCsrfToken();

  return apiFetch<void>(apiEndpoints.authLogout, {
    method: "POST",
    headers: { [csrf.headerName]: csrf.token },
  });
}
