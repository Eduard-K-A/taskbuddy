# Web Admin Console → Real Backend Integration

**Date:** 2026-07-20
**Owner:** Christian Esquillo
**Scope:** Sprint 1 stories #29 (User Management), #31 (Booking Oversight), #32 (Analytics)

## Context

`web/` (the Next.js admin console) currently runs entirely on mock data
(`src/lib/mock/db.ts`). The backend admin module (merged in PR #12,
`erianthe17/taskbuddy` `main`) already implements the real endpoints for
users, bookings, and analytics, and is live at
`https://taskbuddy-1d48.onrender.com`. This spec covers wiring the web
console to that real backend for the three pages that map to Christian's
assigned stories, plus the login screen those pages depend on.

Two of the seven web pages — **Verifications** and **Transactions** — have
no backend support at all (confirmed against `backend/BACKEND_SCHEMA.md`
§14 "Out of Scope": provider document verification and
payments/escrow/wallets are explicitly deferred, not just "not built yet").
They are out of scope for this work and continue running on mock data
through the existing service-function seam, unchanged.

## Goals

- Users, Bookings, and Reports/Analytics pages show and mutate real data
  from the live backend.
- Login is real: validates against the backend, persists a session across
  page refresh, and rejects suspended accounts (already implemented
  backend-side).
- Domain types in `web/` match the backend's actual enums/fields — no more
  invented statuses that don't correspond to real data.
- Booking cancellation works end-to-end, including a new backend endpoint
  for it (previously missing).
- `web/` is deployed to Vercel, pointed at the live backend.

## Non-goals

- Verifications page (provider document approval) — no backend tables
  exist; stays mocked.
- Transactions page (payments/escrow) — explicitly out of scope per
  `BACKEND_SCHEMA.md` §14; stays mocked.
- Dashboard Overview page (story #27) — not part of Christian's assigned
  stories; left on mock data. (Its stats overlap partially with the
  analytics endpoint, but wiring it is out of scope here.)
- Revenue figures anywhere (`totalRevenue`, `monthlyRevenue`, revenue
  chart series) — no payments system exists in the backend; these remain
  mocked/zeroed with a comment explaining why, not silently faked as real.
- Booking `amount` (the Bookings page's "Amount" column) — the real `jobs`
  table has no price/amount field at all (payments are out of scope, same
  as above). The column and field stay exactly as they are in the UI
  today, sourced from a fixed placeholder value with a `// later:` style
  comment, not removed and not fabricated per-row — same treatment as
  revenue, ready to wire in one line once a future pricing story adds a
  real field.

## Design

### 1. Domain types (`web/src/lib/domain.ts`)

Replace the invented `SharedUser`/`SharedBooking` shapes with the real
backend contracts:

- `UserRole`: `"client" | "provider" | "admin"` (was `"homeowner" |
  "provider" | "admin"`).
- `UserStatus`: `"ACTIVE" | "SUSPENDED"` (drops `"BANNED"` — the real
  schema only has `deactivated_at`, no separate ban tier).
- `BookingStatus`: `"open" | "recommending" | "assigned" | "in_progress" |
  "completed" | "cancelled" | "expired"` (the real `job_status` enum,
  replacing the invented `PENDING/CONFIRMED/...` set).
- `AdminUser`/`AdminBooking` fields renamed/reshaped to match what
  `admin_user_overview` and the `jobs` select actually return (e.g.
  `full_name`, `deactivated_at`, `category_name`, joined `client`/
  `provider` objects with `id`/`full_name`).
- `Verification`/`Transaction` types are untouched.

### 2. Adapters (`web/src/lib/adapters/index.ts`)

- `BOOKING_STATUS_DISPLAY` rebuilt for the 7 real statuses, including new
  badge treatment for `recommending` and `expired` (never exercised by
  mock data).
- `USER_STATUS_DISPLAY` simplified to the two real states; any UI control
  for a "Banned" status is removed.
- `isCancellableBooking` updated to the real cancellable set: `open`,
  `recommending`, `assigned`, `in_progress`.
- `toUserRow`/`toBookingRow` updated for the new field names.
- `adapters.test.ts` fixtures updated to match.

### 3. API client & session (`web/src/lib/api/client.ts`, `AppContext.tsx`)

- `client.ts`: reads a stored access token and attaches
  `Authorization: Bearer <token>` to every request. On a 401/403, clears
  the stored token and surfaces a distinguishable error so the caller can
  force a logout.
- Token persisted to `localStorage` (same mechanism already used for
  `ConsoleSettings` prefs).
- `AppContext`:
  - `login()` calls the real endpoint, stores token + admin profile on
    success.
  - On mount, checks for a stored token to restore a session instead of
    always starting logged out.
  - The initial data-fetch `useEffect` only runs once `isLoggedIn` is
    true, instead of firing unconditionally on mount.
  - `logout()` calls the real `/auth/logout` and clears the stored token.

### 4. Page wiring (`web/src/lib/services/index.ts`)

| Function | Becomes |
|---|---|
| `login` | `client.post("/auth/login", { email, password })` |
| `getUsers` | `client.get("/admin/users?search=&role=&status=")` |
| `setUserStatus` | `client.post(".../suspend")` or `.../reinstate` depending on target status |
| `getBookings` | `client.get("/admin/bookings?status=&category_id=")` |
| `getDashboardStats`, `getBookingsSeries`, `getBookingsByCategory`, `getTopProviders` | all derived from one `client.get("/admin/analytics/summary")` call, mapped into each shape |
| `cancelBooking` | `client.post("/admin/bookings/:id/cancel")` (see §5) |
| `getVerifications`, `getTransactions`, `approveVerification`, `rejectVerification` | unchanged (mocked) |

### 5. New backend endpoint: cancel booking

`admin.service.ts` gains a `cancelBooking(id)` method and
`admin.controller.ts` a `POST /admin/bookings/:id/cancel` route, mirroring
the existing `suspend`/`reinstate` pattern:

- Sets `jobs.status = 'cancelled'`.
- Refuses (400) if the job is already in a terminal state (`completed`,
  `cancelled`, `expired`).
- Relies on the existing `log_job_status_change` trigger for the
  `job_status_history` audit row — no migration needed.
- Ships with unit tests in the same style as the existing 14
  (`admin.service.spec.ts`).

This is additive to story #31's original scope (the ticket only asked for
a trackable/filterable view) but was agreed as a natural extension since
the web UI already has a "Cancel booking" action with nothing to call.

### 6. Deployment

- New Vercel project connected to the GitHub repo, root directory `web/`.
- Env vars set in Vercel: `NEXT_PUBLIC_USE_MOCK=false`,
  `NEXT_PUBLIC_API_URL=https://taskbuddy-1d48.onrender.com`.
- CORS requires no backend change — `main.ts` already calls
  `app.enableCors()` with no origin restriction.

## Testing

- Existing `adapters.test.ts` updated for the new domain shapes.
- New unit tests for the cancel-booking endpoint (backend), matching the
  style of the existing 14 admin/auth tests.
- Manual verification: log in with the real admin account, exercise
  search/suspend/reinstate on Users, filter/cancel on Bookings, and view
  Reports against live data, both locally (`npm run dev` against the live
  Render URL) and on the deployed Vercel URL.

## Risks / open questions

- None blocking. The main risk is that if the live Render backend's shape
  changes later (e.g. a teammate alters the `jobs` table), the web
  adapters would need a follow-up update — same risk any API consumer has.
