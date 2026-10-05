import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

type CsrfToken = {
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

export async function login(userid: string, password: string) {
  const csrf = await apiFetch<CsrfToken>(apiEndpoints.authCsrf, {
    cache: "no-store",
  });

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
