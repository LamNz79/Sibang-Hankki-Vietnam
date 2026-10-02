// src/lib/api/client.ts
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Server: gọi thẳng backend. Client: dùng same-origin (qua rewrites, xem mục 4).
const getBaseUrl = () =>
  typeof window === "undefined"
    ? (process.env.API_BASE_URL ?? "http://localhost:8080")
    : "";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(
      res.status,
      `${res.status} ${res.statusText}`,
      await res.json().catch(() => undefined),
    );
  }

  return (res.status === 204 ? undefined : await res.json()) as T;
}