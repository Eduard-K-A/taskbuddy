// ─── API client ───────────────────────────────────────────────────────────────
// The single place that will talk to the real backend. Unused while USE_MOCK
// is true; when the backend (apps/backend) ships its admin endpoints, flip
// each service function from the mock DB to these helpers.

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** True until the real backend is available. Set NEXT_PUBLIC_USE_MOCK=false
 *  (plus NEXT_PUBLIC_API_URL) to switch the whole admin console to live data. */
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
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new ApiError(res.status, `${init?.method ?? "GET"} ${path} → ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const client = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
};
