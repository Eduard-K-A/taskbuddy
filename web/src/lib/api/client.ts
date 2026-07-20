// ─── API client ───────────────────────────────────────────────────────────────
// The single place that talks to the real backend. Attaches the stored admin
// session's bearer token to every request; clears the session and surfaces a
// distinguishable ApiError on 401/403 so callers (AppContext) can force a
// logout.

import { clearStoredSession, getStoredSession } from "./session";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** True until a page's service functions are switched over. Currently
 *  unused by the wired pages (Users/Bookings/Reports/Login always call the
 *  real backend) — Verifications/Transactions ignore this flag and stay
 *  mocked outright. Kept for parity with the original data-seam design. */
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredSession()?.accessToken;
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) clearStoredSession();
    let message = `${init?.method ?? "GET"} ${path} → ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body?.message === "string") message = body.message;
    } catch {
      // body wasn't JSON — keep the generic message
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

export const client = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
};
