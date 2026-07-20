# Web Admin Console → Real Backend Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the `web/` admin console's Users, Bookings, and Reports pages (plus login) to the live backend, replacing mock data, and add the one missing backend endpoint (cancel booking) they depend on.

**Architecture:** The existing `services/index.ts` seam stays in place — only the function bodies for the in-scope pages change from reading `lib/mock/db.ts` to calling `lib/api/client.ts`. Domain types (`lib/domain.ts`) are corrected to match the backend's real enums/fields first, since everything downstream depends on them. Verifications/Transactions pages and their mock functions are untouched.

**Tech Stack:** NestJS + Supabase (backend, unchanged module pattern), Next.js 16 + React 19 + Vitest (web), Jest (backend).

## Global Constraints

- Verifications and Transactions pages/services stay on mock data — no backend tables exist for them (`backend/BACKEND_SCHEMA.md` §14).
- Dashboard Overview page (story #27) is not modified directly, though it shares `AppContext` state with Reports and will incidentally show some real figures as a side effect (see Task 7 notes) — this is acceptable, not additional scope.
- Revenue figures (`totalRevenue`, `monthlyRevenue`, `avgRating`) and booking `amount` stay sourced from fixed mock/placeholder values — no payments system exists in the backend. Never compute or display a fabricated per-record number for these.
- No pagination UI exists on Users/Bookings tables; request a generous fixed page size (200) instead of building pagination — out of scope for this plan.
- Follow the existing code style exactly: the backend admin module's `suspend`/`reinstate` pattern for the new `cancelBooking`; the web `services/index.ts` `// later:` comment convention where something stays mocked.
- Reference spec: `docs/superpowers/specs/2026-07-20-web-backend-integration-design.md`.

---

### Task 1: Backend — cancel-booking endpoint

**Files:**
- Modify: `backend/src/admin/admin.service.ts`
- Modify: `backend/src/admin/admin.controller.ts`
- Test: `backend/src/admin/admin.service.spec.ts`

**Interfaces:**
- Produces: `AdminService.cancelBooking(jobId: string): Promise<unknown>` — resolves with the updated `jobs` row; throws `NotFoundException` if the job doesn't exist, `BadRequestException` if it's already `completed`/`cancelled`/`expired`.
- Produces: `POST /admin/bookings/:id/cancel` route (same guard/role setup as the other admin routes — no new wiring needed, `AdminController` already has `@UseGuards(JwtAuthGuard)` and `@Roles('admin')` at the class level).

- [ ] **Step 1: Write the failing tests**

Add this `describe` block to the end of `backend/src/admin/admin.service.spec.ts`, right after the existing `describe("analyticsSummary", ...)` block (before the final closing `});` of the outer `describe("AdminService", ...)`):

```ts
  describe('cancelBooking', () => {
    it('cancels an open booking', async () => {
      const updated = { id: 'j1', status: 'cancelled' };
      const { supabase, calls } = createSupabaseMock({
        jobs: [
          { data: { id: 'j1', status: 'open' }, error: null },
          { data: updated, error: null },
        ],
      });
      const service = new AdminService(supabase);

      const result = await service.cancelBooking('j1');

      expect(result).toEqual(updated);
      const updateCall = calls.find((c) => c.method === 'update');
      expect(updateCall?.args[0]).toEqual({ status: 'cancelled' });
    });

    it('refuses to cancel an already-completed booking', async () => {
      const { supabase } = createSupabaseMock({
        jobs: [{ data: { id: 'j1', status: 'completed' }, error: null }],
      });
      const service = new AdminService(supabase);

      await expect(service.cancelBooking('j1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('404s on an unknown booking', async () => {
      const { supabase } = createSupabaseMock({
        jobs: [{ data: null, error: null }],
      });
      const service = new AdminService(supabase);

      await expect(service.cancelBooking('j404')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx jest admin.service.spec.ts`
Expected: FAIL — `service.cancelBooking is not a function`

- [ ] **Step 3: Implement `cancelBooking` in the service**

In `backend/src/admin/admin.service.ts`, add this method inside the `AdminService` class, directly after the existing `listBookings` method (before the `analyticsSummary` method):

```ts
  /** Cancels a booking (story #31 extension) — refuses if it's already in a
   *  terminal state. Relies on the existing `log_job_status_change` trigger
   *  for the `job_status_history` audit row; no migration needed. */
  async cancelBooking(jobId: string) {
    const { data: job, error } = await this.supabase.admin
      .from('jobs')
      .select('id, status')
      .eq('id', jobId)
      .maybeSingle();
    if (error) throw new BadRequestException(error.message);
    if (!job) throw new NotFoundException('Booking not found');
    if (['completed', 'cancelled', 'expired'].includes(job.status)) {
      throw new BadRequestException(`Booking is already ${job.status}`);
    }
    const { data, error: updateError } = await this.supabase.admin
      .from('jobs')
      .update({ status: 'cancelled' })
      .eq('id', jobId)
      .select('*')
      .single();
    if (updateError) throw new BadRequestException(updateError.message);
    return data;
  }
```

- [ ] **Step 4: Add the route**

In `backend/src/admin/admin.controller.ts`, add this method inside the `AdminController` class, directly after the existing `listBookings` method (before `analyticsSummary`):

```ts
  @Post('bookings/:id/cancel')
  cancelBooking(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.cancelBooking(id);
  }
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd backend && npx jest admin.service.spec.ts`
Expected: PASS — all tests including the 3 new ones (17 total in this file)

- [ ] **Step 6: Full backend verification**

Run: `cd backend && npx tsc --noEmit && npx eslint src/admin && npx jest`
Expected: no type errors, no lint errors, all tests pass

- [ ] **Step 7: Commit**

```bash
cd backend
git add src/admin/admin.service.ts src/admin/admin.controller.ts src/admin/admin.service.spec.ts
git commit -m "feat(backend): add booking cancel endpoint for admin bookings page"
```

---

### Task 2: Web — correct domain types to match the real backend

**Files:**
- Modify: `web/src/lib/domain.ts`

**Interfaces:**
- Produces: `UserRole = "client" | "provider" | "admin"`, `UserStatus = "ACTIVE" | "SUSPENDED"`, `BookingStatus = "open" | "recommending" | "assigned" | "in_progress" | "completed" | "cancelled" | "expired"`, `AdminUser`, `AdminBooking` — consumed by Tasks 3, 6, 7, 8, 9.
- `Verification`/`Transaction`/`DashboardStats`/`MonthlyPoint`/`CategoryShare`/`ActivityEvent`/`TopProvider`/`Page` are unchanged.

- [ ] **Step 1: Replace the file**

Replace the entire contents of `web/src/lib/domain.ts` with:

```ts
// ─── Domain types ─────────────────────────────────────────────────────────────
// "Backend-shaped" data: numbers, enums, ISO dates. UserRole/BookingStatus
// mirror the real Supabase enums (`user_role`, `job_status` — see
// backend/BACKEND_SCHEMA.md §4). Verification/Transaction stay invented:
// no backend tables exist for them yet (see the non-goals in
// docs/superpowers/specs/2026-07-20-web-backend-integration-design.md).

export type Page =
  | "dashboard"
  | "verifications"
  | "users"
  | "transactions"
  | "bookings"
  | "reports"
  | "settings";

// ─── Users ────────────────────────────────────────────────────────────────────

export type UserRole = "client" | "provider" | "admin";
/** The real schema only has `deactivated_at` — no separate "banned" tier. */
export type UserStatus = "ACTIVE" | "SUSPENDED";

/** Admin view of a user: the `admin_user_overview` row (migration 0005),
 *  remapped for display. */
export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  name: string;
  status: UserStatus;
  /** Provider's completed-job count; 0 for clients — the view has no
   *  per-client completed-job count today. */
  jobsCompleted: number;
  /** Provider average rating; null for clients. */
  rating: number | null;
}

// ─── Verifications ────────────────────────────────────────────────────────────

export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Verification {
  id: string;
  providerId: string;
  // Denormalized for the admin list — the backend admin API returns these joined.
  name: string;
  email: string;
  submittedAt: string; // ISO date
  status: VerificationStatus;
  documents: string[];
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export type TransactionStatus = "COMPLETED" | "IN_ESCROW" | "DISPUTED" | "REFUNDED";

export interface Transaction {
  id: string;
  customerName: string;
  providerName: string;
  service: string;
  amount: number;
  status: TransactionStatus;
  date: string; // ISO date
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

/** Mirrors the real `job_status` enum (BACKEND_SCHEMA.md §4). */
export type BookingStatus =
  | "open"
  | "recommending"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "expired";

export interface AdminBooking {
  id: string;
  customerName: string;
  providerName: string;
  service: string;
  status: BookingStatus;
  /** The job's `posted_at` — the real schema has no scheduling/time-slot
   *  concept (BACKEND_SCHEMA.md §14), so this is "when posted", not "when
   *  scheduled for". */
  scheduledDate: string;
  /** Placeholder — the real `jobs` table has no price field (payments are
   *  out of scope). Not sourced from the backend; see the design spec's
   *  non-goals. */
  amount: number;
}

// ─── Analytics / dashboard ────────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  activeProviders: number;
  totalBookings: number;
  pendingVerifications: number;
  totalRevenue: number;
  monthlyRevenue: number;
  completionRate: number; // 0–100
  avgRating: number;
}

export interface MonthlyPoint {
  month: string;
  value: number;
}

export interface CategoryShare {
  label: string;
  value: number; // percent 0–100
}

export type ActivityType = "verif" | "tx" | "user" | "alert";

export interface ActivityEvent {
  time: string;
  text: string;
  type: ActivityType;
}

export interface TopProvider {
  name: string;
  jobs: number;
  rating: number;
}
```

- [ ] **Step 2: Confirm it breaks downstream (expected)**

Run: `cd web && npx tsc --noEmit`
Expected: FAIL — errors in `lib/adapters/index.ts`, `lib/adapters/adapters.test.ts`, `lib/mock/db.ts`, `lib/services/index.ts`, `components/pages/UsersPage.tsx`, `components/pages/BookingsPage.tsx`. This is expected; each is fixed in a later task. Do not fix them here.

- [ ] **Step 3: Commit**

```bash
cd web
git add src/lib/domain.ts
git commit -m "feat(web): correct domain types to match real backend enums"
```

---

### Task 3: Web — rebuild adapters for the real statuses

**Files:**
- Modify: `web/src/lib/adapters/index.ts`
- Modify: `web/src/lib/adapters/adapters.test.ts`

**Interfaces:**
- Consumes: `UserRole`, `UserStatus`, `BookingStatus`, `AdminUser`, `AdminBooking` from Task 2.
- Produces: `UserRow`, `BookingRow` (unchanged shapes), `BOOKING_STATUS_DISPLAY`, `USER_STATUS_DISPLAY`, `isCancellableBooking`, `toUserRow`, `toBookingRow` — consumed by `AppContext.tsx` (unchanged usage) and `UsersPage.tsx`/`BookingsPage.tsx` (Tasks 8, 9).
- `TransactionRow`, `VerificationRow`, `toTransactionRow`, `toVerificationRow`, `TRANSACTION_STATUS_DISPLAY`, `initials`, `formatCurrency`, `formatCurrencyCompact`, `formatDate` are unchanged.

- [ ] **Step 1: Write the failing tests**

Replace the entire contents of `web/src/lib/adapters/adapters.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import {
  BOOKING_STATUS_DISPLAY,
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
  initials,
  isCancellableBooking,
  toBookingRow,
  toTransactionRow,
  toUserRow,
  toVerificationRow,
} from "./index";
import type { AdminBooking, AdminUser, Transaction, Verification } from "@/lib/domain";

describe("initials", () => {
  it("takes first and last name initials", () => {
    expect(initials("Morgan Lee")).toBe("ML");
    expect(initials("Jamie de la Cruz")).toBe("JC");
  });
  it("handles single names and empty input", () => {
    expect(initials("Cher")).toBe("CH");
    expect(initials("  ")).toBe("?");
  });
});

describe("formatCurrency", () => {
  it("formats pesos with thousands separators", () => {
    expect(formatCurrency(1200)).toBe("₱1,200");
    expect(formatCurrency(184200)).toBe("₱184,200");
  });
  it("compacts large figures", () => {
    expect(formatCurrencyCompact(2_400_000)).toBe("₱2.4M");
    expect(formatCurrencyCompact(184_200)).toBe("₱184.2K");
    expect(formatCurrencyCompact(980)).toBe("₱980");
  });
});

describe("formatDate", () => {
  it("renders ISO dates without timezone drift", () => {
    expect(formatDate("2026-04-10")).toBe("Apr 10, 2026");
    expect(formatDate("2024-03-01")).toBe("Mar 1, 2024");
  });
  it("passes through malformed input", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});

describe("booking status mapping", () => {
  it("maps every real job_status to a distinct label", () => {
    expect(BOOKING_STATUS_DISPLAY.open.label).toBe("Open");
    expect(BOOKING_STATUS_DISPLAY.recommending.label).toBe("Matching");
    expect(BOOKING_STATUS_DISPLAY.assigned.label).toBe("Assigned");
    expect(BOOKING_STATUS_DISPLAY.in_progress.label).toBe("In Progress");
    expect(BOOKING_STATUS_DISPLAY.completed.label).toBe("Completed");
    expect(BOOKING_STATUS_DISPLAY.cancelled.label).toBe("Cancelled");
    expect(BOOKING_STATUS_DISPLAY.expired.label).toBe("Expired");
  });
  it("only allows cancelling bookings still in flight", () => {
    expect(isCancellableBooking("open")).toBe(true);
    expect(isCancellableBooking("recommending")).toBe(true);
    expect(isCancellableBooking("assigned")).toBe(true);
    expect(isCancellableBooking("in_progress")).toBe(true);
    expect(isCancellableBooking("completed")).toBe(false);
    expect(isCancellableBooking("cancelled")).toBe(false);
    expect(isCancellableBooking("expired")).toBe(false);
  });
});

describe("row adapters", () => {
  it("maps a provider user to a display row", () => {
    const u: AdminUser = {
      id: "u-001", email: "morgan@example.com", role: "provider",
      createdAt: "2024-03-10", name: "Morgan Lee", status: "ACTIVE",
      jobsCompleted: 21, rating: 4.9,
    };
    const row = toUserRow(u);
    expect(row).toMatchObject({
      id: "u-001", initials: "ML", role: "🔧 Provider", isProvider: true,
      status: "Active", statusClass: "badge-active",
      joined: "Mar 10, 2024", activity: "21 jobs ⭐4.9",
    });
  });

  it("maps a suspended client without rating", () => {
    const u: AdminUser = {
      id: "u-002", email: "j.kim@example.com", role: "client",
      createdAt: "2024-02-22", name: "Jamie Kim", status: "SUSPENDED",
      jobsCompleted: 0, rating: null,
    };
    const row = toUserRow(u);
    expect(row.role).toBe("👤 Customer");
    expect(row.avClass).toBe("av-green");
    expect(row.activity).toBe("0 jobs");
    expect(row.statusClass).toBe("badge-suspended");
  });

  it("maps verification docs to the dotted display string", () => {
    const v: Verification = {
      id: "vr-001", providerId: "u-001", name: "Morgan Lee",
      email: "morgan@example.com", submittedAt: "2026-05-02",
      status: "PENDING", documents: ["Gov ID", "Service Cert"],
    };
    const row = toVerificationRow(v);
    expect(row.status).toBe("pending");
    expect(row.docs).toBe("Gov ID · Service Cert");
    expect(row.date).toBe("May 2, 2026");
  });

  it("maps transactions with both display and numeric amounts", () => {
    const t: Transaction = {
      id: "TXN-002", customerName: "Jamie Kim", providerName: "Pat Morgan",
      service: "Plumbing", amount: 850, status: "IN_ESCROW", date: "2026-04-12",
    };
    const row = toTransactionRow(t);
    expect(row.amount).toBe("₱850");
    expect(row.amountValue).toBe(850);
    expect(row.status).toBe("In Escrow");
    expect(row.statusClass).toBe("badge-processing");
  });

  it("maps bookings with cancellability", () => {
    const b: AdminBooking = {
      id: "BK-0090", customerName: "Jamie Kim", providerName: "Pat Morgan",
      service: "Plumbing Repair", status: "assigned",
      scheduledDate: "2026-04-12", amount: 0,
    };
    const row = toBookingRow(b);
    expect(row.status).toBe("Assigned");
    expect(row.cancellable).toBe(true);
    expect(toBookingRow({ ...b, status: "completed" }).cancellable).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd web && npx vitest run src/lib/adapters/adapters.test.ts`
Expected: FAIL — `BOOKING_STATUS_DISPLAY.open` is undefined, `AdminUser` type errors (role "provider"/"client" not yet matching old code, `status: "SUSPENDED"` not in old `Record`), etc.

- [ ] **Step 3: Replace the adapters implementation**

Replace the entire contents of `web/src/lib/adapters/index.ts` with:

```ts
// ─── Adapters: domain → display ───────────────────────────────────────────────
// Pure functions that turn backend-shaped domain data into the exact display
// shapes the components render (formatted currency, badge classes, initials…).
// Keeping this mapping in one place means components never change when the
// data source flips from mock to the real API.

import type {
  AdminBooking,
  AdminUser,
  BookingStatus,
  Transaction,
  TransactionStatus,
  UserStatus,
  Verification,
} from "@/lib/domain";

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/** "Morgan Lee" → "ML"; single names use the first two letters. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** 1200 → "₱1,200" */
export function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString("en-PH")}`;
}

/** 2400000 → "₱2.4M", 184200 → "₱184.2K" (dashboard-style compact figures). */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toLocaleString("en-PH", { maximumFractionDigits: 1 })}M`;
  if (amount >= 100_000) return `₱${(amount / 1_000).toLocaleString("en-PH", { maximumFractionDigits: 1 })}K`;
  return formatCurrency(amount);
}

/** ISO "2026-04-10" → "Apr 10, 2026". Parsed as local date to avoid TZ drift. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("T")[0].split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Status → display maps ────────────────────────────────────────────────────

export const USER_STATUS_DISPLAY: Record<UserStatus, { label: string; badgeClass: string }> = {
  ACTIVE:    { label: "Active",    badgeClass: "badge-active" },
  SUSPENDED: { label: "Suspended", badgeClass: "badge-suspended" },
};

export const TRANSACTION_STATUS_DISPLAY: Record<TransactionStatus, { label: string; badgeClass: string }> = {
  COMPLETED: { label: "Completed", badgeClass: "badge-completed" },
  IN_ESCROW: { label: "In Escrow", badgeClass: "badge-processing" },
  DISPUTED:  { label: "Disputed",  badgeClass: "badge-rejected" },
  REFUNDED:  { label: "Refunded",  badgeClass: "badge-refunded" },
};

/** Mirrors the real `job_status` enum — each status gets its own label so
 *  the admin view reflects the real lifecycle, not a re-collapsed one. */
export const BOOKING_STATUS_DISPLAY: Record<BookingStatus, { label: string; badgeClass: string }> = {
  open:         { label: "Open",        badgeClass: "badge-pending" },
  recommending: { label: "Matching",    badgeClass: "badge-processing" },
  assigned:     { label: "Assigned",    badgeClass: "badge-active" },
  in_progress:  { label: "In Progress", badgeClass: "badge-active" },
  completed:    { label: "Completed",   badgeClass: "badge-completed" },
  cancelled:    { label: "Cancelled",   badgeClass: "badge-cancelled" },
  expired:      { label: "Expired",     badgeClass: "badge-rejected" },
};

/** Bookings an admin can still cancel — anything not yet in a terminal state. */
export function isCancellableBooking(status: BookingStatus): boolean {
  return status === "open" || status === "recommending" || status === "assigned" || status === "in_progress";
}

// ─── Display row types (what components render) ───────────────────────────────

export interface UserRow {
  id: string;
  initials: string;
  avClass: "av-indigo" | "av-green" | "av-violet";
  name: string;
  email: string;
  role: string;
  isProvider: boolean;
  status: string;
  statusClass: string;
  joined: string;
  activity: string;
}

export interface VerificationRow {
  id: string;
  initials: string;
  name: string;
  email: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  docs: string;
}

export interface TransactionRow {
  id: string;
  customer: string;
  provider: string;
  service: string;
  amount: string;
  /** Raw numeric amount for aggregations (total volume, etc.). */
  amountValue: number;
  status: string;
  statusClass: string;
  date: string;
}

export interface BookingRow {
  id: string;
  customer: string;
  provider: string;
  service: string;
  status: string;
  statusClass: string;
  date: string;
  amount: string;
  cancellable: boolean;
}

// ─── Row adapters ─────────────────────────────────────────────────────────────

export function toUserRow(u: AdminUser): UserRow {
  const display = USER_STATUS_DISPLAY[u.status];
  const isProvider = u.role === "provider";
  return {
    id: u.id,
    initials: initials(u.name),
    // Customers are green; providers alternate indigo/violet deterministically.
    avClass: !isProvider
      ? "av-green"
      : u.id.charCodeAt(u.id.length - 1) % 2 === 0
        ? "av-violet"
        : "av-indigo",
    name: u.name,
    email: u.email,
    role: isProvider ? "🔧 Provider" : u.role === "admin" ? "🛡️ Admin" : "👤 Customer",
    isProvider,
    status: display.label,
    statusClass: display.badgeClass,
    joined: formatDate(u.createdAt),
    activity: `${u.jobsCompleted} job${u.jobsCompleted === 1 ? "" : "s"}${u.rating ? ` ⭐${u.rating}` : ""}`,
  };
}

export function toVerificationRow(v: Verification): VerificationRow {
  return {
    id: v.id,
    initials: initials(v.name),
    name: v.name,
    email: v.email,
    date: formatDate(v.submittedAt),
    status: v.status.toLowerCase() as VerificationRow["status"],
    docs: v.documents.join(" · "),
  };
}

export function toTransactionRow(t: Transaction): TransactionRow {
  const display = TRANSACTION_STATUS_DISPLAY[t.status];
  return {
    id: t.id,
    customer: t.customerName,
    provider: t.providerName,
    service: t.service,
    amount: formatCurrency(t.amount),
    amountValue: t.amount,
    status: display.label,
    statusClass: display.badgeClass,
    date: formatDate(t.date),
  };
}

export function toBookingRow(b: AdminBooking): BookingRow {
  const display = BOOKING_STATUS_DISPLAY[b.status];
  return {
    id: b.id,
    customer: b.customerName,
    provider: b.providerName,
    service: b.service,
    status: display.label,
    statusClass: display.badgeClass,
    date: formatDate(b.scheduledDate),
    amount: formatCurrency(b.amount),
    cancellable: isCancellableBooking(b.status),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd web && npx vitest run src/lib/adapters/adapters.test.ts`
Expected: PASS — all tests green

- [ ] **Step 5: Commit**

```bash
cd web
git add src/lib/adapters/index.ts src/lib/adapters/adapters.test.ts
git commit -m "feat(web): rebuild status adapters for the real job_status/user_role enums"
```

---

### Task 4: Web — API wire types, session storage, and authenticated client

**Files:**
- Create: `web/src/lib/api/types.ts`
- Create: `web/src/lib/api/session.ts`
- Test: `web/src/lib/api/session.test.ts`
- Modify: `web/src/lib/api/client.ts`
- Test: `web/src/lib/api/client.test.ts`

**Interfaces:**
- Produces (`types.ts`): `LoginApiResponse`, `AdminUserApiRow`, `ListUsersApiResponse`, `JobStatusApi`, `AdminBookingApiRow`, `ListBookingsApiResponse`, `AnalyticsSummaryApiResponse` — consumed by Tasks 5, 6.
- Produces (`session.ts`): `StoredSession { accessToken: string; adminProfile: { name: string; email: string } }`, `getStoredSession(): StoredSession | null`, `setStoredSession(session: StoredSession): void`, `clearStoredSession(): void`.
- Produces (`client.ts`): `client.get<T>(path)`, `client.post<T>(path, body?)`, `client.patch<T>(path, body?)`, `ApiError { status: number }`, `API_URL`, `USE_MOCK` (unchanged from before) — now attaches `Authorization: Bearer <token>` automatically and clears the session on 401/403.

- [ ] **Step 1: Create the wire types (no test — types only, exercised through Tasks 5/6)**

Create `web/src/lib/api/types.ts`:

```ts
// ─── Wire types ───────────────────────────────────────────────────────────────
// Exact JSON shapes the backend's /admin/* and /auth/* endpoints return.
// Only the fields the web app actually reads are declared — extra backend
// fields present at runtime are simply ignored. Mapped into
// web/src/lib/domain.ts shapes by the services layer; nothing outside
// lib/services should import from here.

export interface LoginApiResponse {
  user: { id: string; email: string };
  session: { access_token: string; refresh_token: string; expires_at: number };
}

export interface AdminUserApiRow {
  id: string;
  email: string;
  full_name: string;
  role: "client" | "provider" | "admin";
  deactivated_at: string | null;
  created_at: string;
  cached_avg_rating: number | null;
  cached_completed_jobs: number | null;
}

export interface ListUsersApiResponse {
  users: AdminUserApiRow[];
  total: number;
}

export type JobStatusApi =
  | "open"
  | "recommending"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "expired";

export interface AdminBookingApiRow {
  id: string;
  status: JobStatusApi;
  posted_at: string;
  service_categories: { name: string } | null;
  client: { id: string; full_name: string } | null;
  provider: { id: string; full_name: string } | null;
}

export interface ListBookingsApiResponse {
  bookings: AdminBookingApiRow[];
  total: number;
}

export interface AnalyticsSummaryApiResponse {
  totals: {
    users: number;
    clients: number;
    providers: number;
    suspended: number;
    bookings: number;
  };
  bookings_by_status: Record<string, number>;
  bookings_by_category: Record<string, number>;
  booking_trend: { date: string; count: number }[];
  top_providers: {
    profile_id: string;
    cached_avg_rating: number | null;
    cached_ratings_count: number | null;
    cached_completed_jobs: number | null;
    profiles: { full_name: string } | null;
    service_categories: { name: string } | null;
  }[];
}
```

- [ ] **Step 2: Write the failing session tests**

Create `web/src/lib/api/session.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { clearStoredSession, getStoredSession, setStoredSession } from "./session";

describe("session storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when nothing is stored", () => {
    expect(getStoredSession()).toBeNull();
  });

  it("round-trips a stored session", () => {
    setStoredSession({
      accessToken: "tok-123",
      adminProfile: { name: "admin@taskbuddy.io", email: "admin@taskbuddy.io" },
    });
    expect(getStoredSession()).toEqual({
      accessToken: "tok-123",
      adminProfile: { name: "admin@taskbuddy.io", email: "admin@taskbuddy.io" },
    });
  });

  it("clears the stored session", () => {
    setStoredSession({ accessToken: "tok", adminProfile: { name: "a", email: "a" } });
    clearStoredSession();
    expect(getStoredSession()).toBeNull();
  });

  it("returns null instead of throwing on corrupted storage", () => {
    localStorage.setItem("tb-admin-session", "{not-json");
    expect(getStoredSession()).toBeNull();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd web && npx vitest run src/lib/api/session.test.ts`
Expected: FAIL — this test file requires a `localStorage`/`window`, and needs `jsdom`. Add the environment to `web/vitest.config.ts` first (see next step), then the failure becomes "Cannot find module './session'".

Update `web/vitest.config.ts` to add a jsdom environment (needed for `localStorage` in this test and the client test in Step 6):

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "jsdom",
  },
});
```

Run: `cd web && npm install -D jsdom && npx vitest run src/lib/api/session.test.ts`
Expected: FAIL — `Cannot find module './session'`

- [ ] **Step 4: Implement session storage**

Create `web/src/lib/api/session.ts`:

```ts
// ─── Session storage ──────────────────────────────────────────────────────────
// Persists the admin's auth session (backend access token + profile) across
// page reloads. Mirrors the localStorage pattern AppContext already uses for
// UI preferences (see PREFS_KEY in context/AppContext.tsx).

export interface StoredSession {
  accessToken: string;
  adminProfile: { name: string; email: string };
}

const SESSION_KEY = "tb-admin-session";

export function getStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null; // corrupted storage — behave as if signed out
  }
}

export function setStoredSession(session: StoredSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd web && npx vitest run src/lib/api/session.test.ts`
Expected: PASS — all 4 tests green

- [ ] **Step 6: Write the failing client tests**

Create `web/src/lib/api/client.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, client } from "./client";
import { clearStoredSession, setStoredSession } from "./session";

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

const originalFetch = global.fetch;

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("client", () => {
  it("attaches the stored bearer token to requests", async () => {
    setStoredSession({ accessToken: "tok-abc", adminProfile: { name: "a", email: "a" } });
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse({ ok: true })));
    global.fetch = fetchMock as unknown as typeof fetch;

    await client.get("/admin/users");

    const [, init] = fetchMock.mock.calls[0];
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer tok-abc");
  });

  it("sends no Authorization header when there is no session", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse({ ok: true })));
    global.fetch = fetchMock as unknown as typeof fetch;

    await client.get("/admin/users");

    const [, init] = fetchMock.mock.calls[0];
    expect((init?.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it("clears the stored session and throws ApiError on 401", async () => {
    setStoredSession({ accessToken: "expired", adminProfile: { name: "a", email: "a" } });
    global.fetch = vi.fn(() =>
      Promise.resolve(jsonResponse({ message: "Invalid or expired token" }, 401)),
    ) as unknown as typeof fetch;

    await expect(client.get("/admin/users")).rejects.toThrow(ApiError);
    expect(localStorage.getItem("tb-admin-session")).toBeNull();
  });

  it("surfaces the backend's error message when present", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve(jsonResponse({ message: "Account is already suspended" }, 400)),
    ) as unknown as typeof fetch;

    await expect(client.post("/admin/users/u1/suspend")).rejects.toThrow(
      "Account is already suspended",
    );
  });
});
```

- [ ] **Step 7: Run tests to verify they fail**

Run: `cd web && npx vitest run src/lib/api/client.test.ts`
Expected: FAIL — no `Authorization` header is attached yet (client.ts doesn't read the session)

- [ ] **Step 8: Update the client implementation**

Replace the entire contents of `web/src/lib/api/client.ts` with:

```ts
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
```

- [ ] **Step 9: Run tests to verify they pass**

Run: `cd web && npx vitest run src/lib/api/client.test.ts src/lib/api/session.test.ts`
Expected: PASS — all 8 tests green

- [ ] **Step 10: Run the full web test suite to check for regressions**

Run: `cd web && npx vitest run`
Expected: PASS — this task doesn't touch any other consumer yet, so nothing else should break

- [ ] **Step 11: Commit**

```bash
cd web
git add src/lib/api/types.ts src/lib/api/session.ts src/lib/api/session.test.ts src/lib/api/client.ts src/lib/api/client.test.ts vitest.config.ts package.json package-lock.json
git commit -m "feat(web): add session storage and authenticated API client"
```

---

### Task 5: Web — analytics mapping module

**Files:**
- Create: `web/src/lib/services/mapAnalytics.ts`
- Test: `web/src/lib/services/mapAnalytics.test.ts`

**Interfaces:**
- Consumes: `AnalyticsSummaryApiResponse` from Task 4.
- Produces: `mapCompletionRate(summary): number`, `mapBookingsSeries(summary): MonthlyPoint[]`, `mapBookingsByCategory(summary): CategoryShare[]`, `mapTopProviders(summary): TopProvider[]` — consumed by Task 6.

- [ ] **Step 1: Write the failing tests**

Create `web/src/lib/services/mapAnalytics.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  mapBookingsByCategory,
  mapBookingsSeries,
  mapCompletionRate,
  mapTopProviders,
} from "./mapAnalytics";
import type { AnalyticsSummaryApiResponse } from "@/lib/api/types";

const SUMMARY: AnalyticsSummaryApiResponse = {
  totals: { users: 10, clients: 6, providers: 4, suspended: 1, bookings: 5 },
  bookings_by_status: { completed: 3, open: 2 },
  bookings_by_category: { Plumbing: 3, Cleaning: 1 },
  booking_trend: [
    { date: "2026-04-01", count: 2 },
    { date: "2026-04-15", count: 1 },
    { date: "2026-05-02", count: 2 },
  ],
  top_providers: [
    {
      profile_id: "p1",
      cached_avg_rating: 4.8,
      cached_ratings_count: 12,
      cached_completed_jobs: 20,
      profiles: { full_name: "Pat Morgan" },
      service_categories: { name: "Plumbing" },
    },
    {
      profile_id: "p2",
      cached_avg_rating: null,
      cached_ratings_count: 0,
      cached_completed_jobs: 0,
      profiles: null,
      service_categories: null,
    },
  ],
};

describe("mapCompletionRate", () => {
  it("computes completed / total as a percentage", () => {
    expect(mapCompletionRate(SUMMARY)).toBe(60);
  });
  it("returns 0 when there are no bookings", () => {
    expect(
      mapCompletionRate({ ...SUMMARY, totals: { ...SUMMARY.totals, bookings: 0 } }),
    ).toBe(0);
  });
});

describe("mapBookingsSeries", () => {
  it("sums daily counts into monthly buckets, sorted", () => {
    expect(mapBookingsSeries(SUMMARY)).toEqual([
      { month: "Apr", value: 3 },
      { month: "May", value: 2 },
    ]);
  });
});

describe("mapBookingsByCategory", () => {
  it("converts counts to percentage shares, largest first", () => {
    expect(mapBookingsByCategory(SUMMARY)).toEqual([
      { label: "Plumbing", value: 75 },
      { label: "Cleaning", value: 25 },
    ]);
  });
  it("returns an empty array when there are no bookings", () => {
    expect(mapBookingsByCategory({ ...SUMMARY, bookings_by_category: {} })).toEqual([]);
  });
});

describe("mapTopProviders", () => {
  it("maps provider rows, defaulting missing names/ratings", () => {
    expect(mapTopProviders(SUMMARY)).toEqual([
      { name: "Pat Morgan", jobs: 20, rating: 4.8 },
      { name: "Unknown provider", jobs: 0, rating: 0 },
    ]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd web && npx vitest run src/lib/services/mapAnalytics.test.ts`
Expected: FAIL — `Cannot find module './mapAnalytics'`

- [ ] **Step 3: Implement the mapping module**

Create `web/src/lib/services/mapAnalytics.ts`:

```ts
// ─── Analytics mapping ────────────────────────────────────────────────────────
// Pure functions turning the backend's /admin/analytics/summary response into
// the separate display shapes the Reports page (and, incidentally, the
// Dashboard Overview page — they share AppContext state) expect. Kept apart
// from services/index.ts so the mapping logic is unit-testable without
// mocking fetch.

import type { AnalyticsSummaryApiResponse } from "@/lib/api/types";
import type { CategoryShare, MonthlyPoint, TopProvider } from "@/lib/domain";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** completed / total bookings, 0–100, one decimal place. */
export function mapCompletionRate(summary: AnalyticsSummaryApiResponse): number {
  const total = summary.totals.bookings;
  if (total === 0) return 0;
  const completed = summary.bookings_by_status["completed"] ?? 0;
  return Math.round((completed / total) * 1000) / 10;
}

/** Daily booking_trend entries summed into monthly buckets, sorted ascending. */
export function mapBookingsSeries(summary: AnalyticsSummaryApiResponse): MonthlyPoint[] {
  const byMonth = new Map<string, number>();
  for (const { date, count } of summary.booking_trend) {
    const key = date.slice(0, 7); // "YYYY-MM"
    byMonth.set(key, (byMonth.get(key) ?? 0) + count);
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      const monthIndex = Number(key.slice(5, 7)) - 1;
      return { month: MONTH_LABELS[monthIndex] ?? key, value };
    });
}

/** bookings_by_category counts converted to percentage shares (rounded —
 *  may not sum to exactly 100, acceptable for a display chart). */
export function mapBookingsByCategory(summary: AnalyticsSummaryApiResponse): CategoryShare[] {
  const entries = Object.entries(summary.bookings_by_category);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  if (total === 0) return [];
  return entries
    .map(([label, count]) => ({ label, value: Math.round((count / total) * 100) }))
    .sort((a, b) => b.value - a.value);
}

export function mapTopProviders(summary: AnalyticsSummaryApiResponse): TopProvider[] {
  return summary.top_providers.map((p) => ({
    name: p.profiles?.full_name ?? "Unknown provider",
    jobs: p.cached_completed_jobs ?? 0,
    rating: p.cached_avg_rating ?? 0,
  }));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd web && npx vitest run src/lib/services/mapAnalytics.test.ts`
Expected: PASS — all 6 tests green

- [ ] **Step 5: Commit**

```bash
cd web
git add src/lib/services/mapAnalytics.ts src/lib/services/mapAnalytics.test.ts
git commit -m "feat(web): add pure mappers from analytics summary to display shapes"
```

---

### Task 6: Web — wire Users/Bookings/Reports/Login to the real backend

**Files:**
- Modify: `web/src/lib/services/index.ts`
- Test: `web/src/lib/services/services.test.ts`
- Modify: `web/src/lib/mock/db.ts`

**Interfaces:**
- Consumes: `client`/`ApiError` (Task 4), wire types (Task 4), `mapCompletionRate`/`mapBookingsSeries`/`mapBookingsByCategory`/`mapTopProviders` (Task 5), `AdminUser`/`AdminBooking`/`UserStatus`/`DashboardStats` (Task 2).
- Produces: same exported function names/signatures as before (`login`, `logout`, `changePassword`, `getUsers`, `getVerifications`, `getTransactions`, `getBookings`, `getDashboardStats`, `getRevenueSeries`, `getBookingsSeries`, `getBookingsByCategory`, `getRecentActivity`, `getTopProviders`, `approveVerification`, `rejectVerification`, `setUserStatus`, `cancelBooking`), plus a new `restoreSession(): { name: string; email: string } | null` and a re-exported `ApiError` — consumed by Task 7 (`AppContext.tsx`).

- [ ] **Step 1: Write the failing tests**

Create `web/src/lib/services/services.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/session", () => ({
  getStoredSession: vi.fn(() => null),
  setStoredSession: vi.fn(),
  clearStoredSession: vi.fn(),
}));

import { clearStoredSession, setStoredSession } from "@/lib/api/session";
import * as services from "./index";

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

const originalFetch = global.fetch;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe("login", () => {
  it("stores the session and returns true on success", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve(
        jsonResponse({
          user: { id: "u1", email: "admin@taskbuddy.io" },
          session: { access_token: "tok", refresh_token: "ref", expires_at: 123 },
        }),
      ),
    ) as unknown as typeof fetch;

    const ok = await services.login("admin@taskbuddy.io", "pw");

    expect(ok).toBe(true);
    expect(setStoredSession).toHaveBeenCalledWith({
      accessToken: "tok",
      adminProfile: { name: "admin@taskbuddy.io", email: "admin@taskbuddy.io" },
    });
  });

  it("returns false on invalid credentials", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve(jsonResponse({ message: "Invalid login credentials" }, 401)),
    ) as unknown as typeof fetch;

    const ok = await services.login("admin@taskbuddy.io", "wrong");

    expect(ok).toBe(false);
  });
});

describe("logout", () => {
  it("clears the stored session even if the request fails", async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error("network down"))) as unknown as typeof fetch;

    await services.logout();

    expect(clearStoredSession).toHaveBeenCalled();
  });
});

describe("getUsers", () => {
  it("maps API rows to AdminUser, deriving status from deactivated_at", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve(
        jsonResponse({
          users: [
            { id: "u1", email: "a@b.c", full_name: "Alice", role: "client", deactivated_at: null, created_at: "2026-01-01", cached_avg_rating: null, cached_completed_jobs: null },
            { id: "u2", email: "b@b.c", full_name: "Bob", role: "provider", deactivated_at: "2026-02-01", created_at: "2026-01-02", cached_avg_rating: 4.5, cached_completed_jobs: 9 },
          ],
          total: 2,
        }),
      ),
    ) as unknown as typeof fetch;

    const users = await services.getUsers();

    expect(users).toEqual([
      { id: "u1", email: "a@b.c", role: "client", createdAt: "2026-01-01", name: "Alice", status: "ACTIVE", jobsCompleted: 0, rating: null },
      { id: "u2", email: "b@b.c", role: "provider", createdAt: "2026-01-02", name: "Bob", status: "SUSPENDED", jobsCompleted: 9, rating: 4.5 },
    ]);
  });
});

describe("setUserStatus", () => {
  it("posts to suspend then refetches users", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => Promise.resolve(jsonResponse({ id: "u1", deactivated_at: "now" })))
      .mockImplementationOnce(() =>
        Promise.resolve(
          jsonResponse({
            users: [{ id: "u1", email: "a@b.c", full_name: "Alice", role: "client", deactivated_at: "now", created_at: "2026-01-01", cached_avg_rating: null, cached_completed_jobs: null }],
            total: 1,
          }),
        ),
      );
    global.fetch = fetchMock as unknown as typeof fetch;

    const users = await services.setUserStatus("u1", "SUSPENDED");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/admin/users/u1/suspend"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(users[0].status).toBe("SUSPENDED");
  });
});

describe("getBookings", () => {
  it("maps API rows to AdminBooking, defaulting unassigned providers", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve(
        jsonResponse({
          bookings: [
            { id: "j1", status: "open", posted_at: "2026-01-01", service_categories: { name: "Plumbing" }, client: { id: "c1", full_name: "Alice" }, provider: null },
          ],
          total: 1,
        }),
      ),
    ) as unknown as typeof fetch;

    const bookings = await services.getBookings();

    expect(bookings).toEqual([
      { id: "j1", customerName: "Alice", providerName: "Unassigned", service: "Plumbing", status: "open", scheduledDate: "2026-01-01", amount: 0 },
    ]);
  });
});

describe("cancelBooking", () => {
  it("posts the cancel action then refetches bookings", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => Promise.resolve(jsonResponse({ id: "j1", status: "cancelled" })))
      .mockImplementationOnce(() =>
        Promise.resolve(
          jsonResponse({
            bookings: [
              { id: "j1", status: "cancelled", posted_at: "2026-01-01", service_categories: { name: "Plumbing" }, client: { id: "c1", full_name: "Alice" }, provider: { id: "p1", full_name: "Bob" } },
            ],
            total: 1,
          }),
        ),
      );
    global.fetch = fetchMock as unknown as typeof fetch;

    const bookings = await services.cancelBooking("j1");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/admin/bookings/j1/cancel"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(bookings[0].status).toBe("cancelled");
  });
});

describe("getDashboardStats", () => {
  it("mixes real totals/completion-rate with mocked revenue/rating", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve(
        jsonResponse({
          totals: { users: 10, clients: 6, providers: 4, suspended: 1, bookings: 5 },
          bookings_by_status: { completed: 3, open: 2 },
          bookings_by_category: {},
          booking_trend: [],
          top_providers: [],
        }),
      ),
    ) as unknown as typeof fetch;

    const stats = await services.getDashboardStats();

    expect(stats.totalUsers).toBe(10);
    expect(stats.activeProviders).toBe(4);
    expect(stats.totalBookings).toBe(5);
    expect(stats.completionRate).toBe(60);
    expect(typeof stats.totalRevenue).toBe("number");
    expect(typeof stats.avgRating).toBe("number");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd web && npx vitest run src/lib/services/services.test.ts`
Expected: FAIL — current `login`/`getUsers`/`getBookings`/`setUserStatus`/`cancelBooking`/`getDashboardStats` still read the mock DB, not `fetch`

- [ ] **Step 3: Trim the mock DB to only what's still mocked**

Replace the entire contents of `web/src/lib/mock/db.ts` with:

```ts
// ─── Mock database ────────────────────────────────────────────────────────────
// An in-memory stand-in for data with no real backend yet. Only consumed by
// the services layer for Verifications, Transactions, revenue, and a few
// dashboard-only figures — everything else (Users, Bookings, most of
// analytics) now reads the real backend; see lib/services/index.ts.

import type {
  ActivityEvent,
  CategoryShare,
  MonthlyPoint,
  TopProvider,
  Transaction,
  Verification,
} from "@/lib/domain";

export const credentials = {
  email: "admin@taskbuddy.io",
  password: "Admin123!",
};

export const verifications: Verification[] = [
  { id: "vr-001", providerId: "u-001", name: "Morgan Lee",   email: "morgan@example.com", submittedAt: "2026-05-02", status: "PENDING",  documents: ["Gov ID", "Service Cert"] },
  { id: "vr-002", providerId: "u-011", name: "Jamie Kim",    email: "jamie@example.com",  submittedAt: "2026-05-03", status: "PENDING",  documents: ["Gov ID", "Business Permit"] },
  { id: "vr-003", providerId: "u-012", name: "Casey Morgan", email: "casey@example.com",  submittedAt: "2026-05-04", status: "PENDING",  documents: ["Gov ID", "Service Cert"] },
  { id: "vr-004", providerId: "u-004", name: "Riley Cooper", email: "riley@example.com",  submittedAt: "2026-05-01", status: "PENDING",  documents: ["Gov ID"] },
  { id: "vr-005", providerId: "u-013", name: "Sam Taylor",   email: "sam@example.com",    submittedAt: "2026-04-30", status: "PENDING",  documents: ["Gov ID", "Service Cert"] },
  { id: "vr-006", providerId: "u-014", name: "Dana Lee",     email: "dana@example.com",   submittedAt: "2026-04-28", status: "APPROVED", documents: ["Gov ID", "Service Cert"] },
  { id: "vr-007", providerId: "u-015", name: "Pat Kim",      email: "pat@example.com",    submittedAt: "2026-04-25", status: "REJECTED", documents: ["Gov ID"] },
];

export const transactions: Transaction[] = [
  { id: "TXN-001", customerName: "Morgan Lee",   providerName: "Sofia Martinez", service: "House Cleaning", amount: 1200, status: "COMPLETED", date: "2026-04-10" },
  { id: "TXN-002", customerName: "Jamie Kim",    providerName: "Pat Morgan",     service: "Plumbing",       amount: 850,  status: "IN_ESCROW", date: "2026-04-12" },
  { id: "TXN-003", customerName: "Casey Morgan", providerName: "Dana Lee",       service: "Electrical",     amount: 2100, status: "COMPLETED", date: "2026-04-14" },
  { id: "TXN-004", customerName: "Riley Cooper", providerName: "Jamie Ross",     service: "Carpentry",      amount: 1500, status: "DISPUTED",  date: "2026-04-08" },
  { id: "TXN-005", customerName: "Sam Taylor",   providerName: "Marcus Rivera",  service: "Painting",       amount: 3400, status: "COMPLETED", date: "2026-04-06" },
  { id: "TXN-006", customerName: "Jordan Blake", providerName: "Chris Kim",      service: "Landscaping",    amount: 980,  status: "REFUNDED",  date: "2026-04-04" },
  { id: "TXN-007", customerName: "Alex Chen",    providerName: "Sofia Martinez", service: "House Cleaning", amount: 1200, status: "COMPLETED", date: "2026-04-02" },
];

// Revenue/rating figures with no real backend source (no payments system —
// BACKEND_SCHEMA.md §14). Kept as fixed mock values, not zeroed, so the
// still-mocked revenue chart series below stays visually consistent with
// these stat-tile numbers.
export const stats = {
  totalRevenue: 2_400_000,
  monthlyRevenue: 184_200,
  avgRating: 4.8,
};

export const revenueSeries: MonthlyPoint[] = [
  { month: "Oct", value: 82000 },
  { month: "Nov", value: 95000 },
  { month: "Dec", value: 128000 },
  { month: "Jan", value: 91000 },
  { month: "Feb", value: 143000 },
  { month: "Mar", value: 167000 },
  { month: "Apr", value: 184200 },
];

export const recentActivity: ActivityEvent[] = [
  { time: "2m ago",  text: "Morgan Lee submitted verification docs",   type: "verif" },
  { time: "15m ago", text: "Transaction TXN-007 marked Completed",     type: "tx" },
  { time: "1h ago",  text: "New user Alex Chen registered",            type: "user" },
  { time: "2h ago",  text: "Dispute raised on TXN-004",                type: "alert" },
  { time: "5h ago",  text: "Pat Morgan completed 25th job",            type: "user" },
];

export const topProviders: TopProvider[] = [
  { name: "Marcus Rivera",  jobs: 38, rating: 4.9 },
  { name: "Sofia Martinez", jobs: 34, rating: 4.7 },
  { name: "Jamie Ross",     jobs: 29, rating: 4.8 },
  { name: "Pat Morgan",     jobs: 25, rating: 4.8 },
  { name: "Jordan Blake",   jobs: 18, rating: 4.7 },
];
```

- [ ] **Step 4: Implement the real service wiring**

Replace the entire contents of `web/src/lib/services/index.ts` with:

```ts
// ─── Services: the data seam ──────────────────────────────────────────────────
// Pages/context call these and never know where data comes from.
// Login, Users, Bookings, and Reports/Analytics call the real backend (see
// lib/api/client.ts). Verifications and Transactions still read the
// in-memory mock DB — no backend tables exist for those yet; see
// docs/superpowers/specs/2026-07-20-web-backend-integration-design.md.

import * as db from "@/lib/mock/db";
import { ApiError, client } from "@/lib/api/client";
import { clearStoredSession, getStoredSession, setStoredSession } from "@/lib/api/session";
import {
  mapBookingsByCategory,
  mapBookingsSeries,
  mapCompletionRate,
  mapTopProviders,
} from "./mapAnalytics";
import type {
  AdminBookingApiRow,
  AdminUserApiRow,
  AnalyticsSummaryApiResponse,
  ListBookingsApiResponse,
  ListUsersApiResponse,
  LoginApiResponse,
} from "@/lib/api/types";
import type {
  ActivityEvent,
  AdminBooking,
  AdminUser,
  CategoryShare,
  DashboardStats,
  MonthlyPoint,
  TopProvider,
  Transaction,
  UserStatus,
  Verification,
} from "@/lib/domain";

export { ApiError };

/** Small artificial latency so the still-mocked pages' loading path is
 *  genuinely exercised (Verifications/Transactions only — real calls have
 *  their own network latency). */
const simulate = <T>(data: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), 150));

// Users/Bookings tables render fully client-side with no pagination UI —
// request a generous page size instead of building pagination this pass.
const LIST_PAGE_SIZE = 200;

/** Booking `amount` has no backing field in the real `jobs` table (payments
 *  are out of scope — BACKEND_SCHEMA.md §14). Fixed placeholder so the
 *  column/field stay unchanged until a future pricing story adds one. */
const PLACEHOLDER_BOOKING_AMOUNT = 0;

function mapUserRow(row: AdminUserApiRow): AdminUser {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    name: row.full_name,
    status: row.deactivated_at ? "SUSPENDED" : "ACTIVE",
    jobsCompleted: row.cached_completed_jobs ?? 0,
    rating: row.cached_avg_rating,
  };
}

function mapBookingRow(row: AdminBookingApiRow): AdminBooking {
  return {
    id: row.id,
    customerName: row.client?.full_name ?? "Unknown client",
    providerName: row.provider?.full_name ?? "Unassigned",
    service: row.service_categories?.name ?? "Uncategorized",
    status: row.status,
    scheduledDate: row.posted_at,
    amount: PLACEHOLDER_BOOKING_AMOUNT,
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<boolean> {
  try {
    const res = await client.post<LoginApiResponse>("/auth/login", { email, password });
    // The backend only returns an email, not a display name, on login.
    setStoredSession({
      accessToken: res.session.access_token,
      adminProfile: { name: res.user.email, email: res.user.email },
    });
    return true;
  } catch {
    return false;
  }
}

/** Reads a previously stored session (survives page reloads). */
export function restoreSession(): { name: string; email: string } | null {
  return getStoredSession()?.adminProfile ?? null;
}

export async function logout(): Promise<void> {
  try {
    await client.post("/auth/logout");
  } catch {
    // best-effort — the local session below is cleared regardless
  } finally {
    clearStoredSession();
  }
}

export async function changePassword(current: string, next: string): Promise<boolean> {
  // No backend endpoint exists for this yet — kept mocked.
  if (current !== db.credentials.password) return simulate(false);
  db.credentials.password = next;
  return simulate(true);
}

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<AdminUser[]> {
  const res = await client.get<ListUsersApiResponse>(`/admin/users?limit=${LIST_PAGE_SIZE}`);
  return res.users.map(mapUserRow);
}

export async function getVerifications(): Promise<Verification[]> {
  return simulate([...db.verifications]);
}

export async function getTransactions(): Promise<Transaction[]> {
  return simulate([...db.transactions]);
}

export async function getBookings(): Promise<AdminBooking[]> {
  const res = await client.get<ListBookingsApiResponse>(`/admin/bookings?limit=${LIST_PAGE_SIZE}`);
  return res.bookings.map(mapBookingRow);
}

async function getAnalyticsSummary(): Promise<AnalyticsSummaryApiResponse> {
  return client.get<AnalyticsSummaryApiResponse>("/admin/analytics/summary");
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const summary = await getAnalyticsSummary();
  return {
    totalUsers: summary.totals.users,
    activeProviders: summary.totals.providers,
    totalBookings: summary.totals.bookings,
    pendingVerifications: db.verifications.filter((v) => v.status === "PENDING").length,
    totalRevenue: db.stats.totalRevenue,
    monthlyRevenue: db.stats.monthlyRevenue,
    completionRate: mapCompletionRate(summary),
    // No platform-wide average-rating figure exists server-side (only the
    // top-10 providers carry cached ratings) — kept mocked.
    avgRating: db.stats.avgRating,
  };
}

export async function getRevenueSeries(): Promise<MonthlyPoint[]> {
  return simulate([...db.revenueSeries]);
}

export async function getBookingsSeries(): Promise<MonthlyPoint[]> {
  return mapBookingsSeries(await getAnalyticsSummary());
}

export async function getBookingsByCategory(): Promise<CategoryShare[]> {
  return mapBookingsByCategory(await getAnalyticsSummary());
}

export async function getRecentActivity(): Promise<ActivityEvent[]> {
  return simulate([...db.recentActivity]);
}

export async function getTopProviders(): Promise<TopProvider[]> {
  return mapTopProviders(await getAnalyticsSummary());
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function approveVerification(id: string): Promise<Verification[]> {
  const v = db.verifications.find((x) => x.id === id);
  if (v) v.status = "APPROVED";
  return simulate([...db.verifications]);
}

export async function rejectVerification(id: string): Promise<Verification[]> {
  const v = db.verifications.find((x) => x.id === id);
  if (v) v.status = "REJECTED";
  return simulate([...db.verifications]);
}

export async function setUserStatus(id: string, status: UserStatus): Promise<AdminUser[]> {
  await client.post(
    status === "SUSPENDED" ? `/admin/users/${id}/suspend` : `/admin/users/${id}/reinstate`,
  );
  return getUsers();
}

export async function cancelBooking(id: string): Promise<AdminBooking[]> {
  await client.post(`/admin/bookings/${id}/cancel`);
  return getBookings();
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd web && npx vitest run src/lib/services/services.test.ts`
Expected: PASS — all 7 tests green

- [ ] **Step 6: Run the full web test suite**

Run: `cd web && npx vitest run`
Expected: PASS. This will still fail type-checking in `web/src/context/AppContext.tsx`, `UsersPage.tsx`, `BookingsPage.tsx` (fixed in Tasks 7–9) — that's expected and confirmed separately via `tsc`, not via vitest (vitest here only runs `.test.ts` files, so those component files won't fail vitest, only `tsc --noEmit`). Do not fix those files in this task.

- [ ] **Step 7: Commit**

```bash
cd web
git add src/lib/services/index.ts src/lib/services/services.test.ts src/lib/mock/db.ts
git commit -m "feat(web): wire login/users/bookings/analytics services to the real backend"
```

---

### Task 7: Web — AppContext session restore, real login/logout, deferred data fetch

**Files:**
- Modify: `web/src/context/AppContext.tsx`

**Interfaces:**
- Consumes: `services.login`, `services.logout`, `services.restoreSession`, `services.ApiError` (Task 6).
- Produces: same `AppState` shape as before, with `setUserStatus`'s status parameter narrowed to `"Active" | "Suspended"` (was `"Active" | "Suspended" | "Banned"`) — consumed by Tasks 8 (`UsersPage.tsx`) and unchanged elsewhere.

- [ ] **Step 1: Update the session/login/logout/data-fetch logic**

In `web/src/context/AppContext.tsx`:

Replace the `STATUS_TO_DOMAIN` map (currently includes `Banned`):

```ts
const STATUS_TO_DOMAIN: Record<"Active" | "Suspended", UserStatus> = {
  Active: "ACTIVE",
  Suspended: "SUSPENDED",
};
```

Replace the `setUserStatus` entry in the `AppState` interface:

```ts
  setUserStatus: (id: string, status: "Active" | "Suspended") => Promise<void>;
```

Replace the session/navigation state block (currently `isLoggedIn`/`adminProfile` `useState`s) with:

```ts
  // session / navigation — lazily restored from a stored token on first
  // render (same SSR-safe pattern as loadStoredPrefs() below: null on the
  // server, resolved on the client, no hydration mismatch since neither
  // ever renders before login).
  const [isLoggedIn, setIsLoggedIn] = useState(() => services.restoreSession() !== null);
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(
    () => services.restoreSession() ?? { name: "Super Admin", email: "admin@taskbuddy.io" },
  );
```

Replace the initial-load `useEffect` (currently fires unconditionally on mount) with:

```ts
  // ── initial load — only once a session exists ──
  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [users, verifs, txns, bookings, stats, revenue, bookVol, categories, activity, providers] =
          await Promise.all([
            services.getUsers(),
            services.getVerifications(),
            services.getTransactions(),
            services.getBookings(),
            services.getDashboardStats(),
            services.getRevenueSeries(),
            services.getBookingsSeries(),
            services.getBookingsByCategory(),
            services.getRecentActivity(),
            services.getTopProviders(),
          ]);
        if (cancelled) return;
        setDomainUsers(users);
        setDomainVerifications(verifs);
        setDomainTransactions(txns);
        setDomainBookings(bookings);
        setDashboardStats(stats);
        setRevenueSeries(revenue);
        setBookingsSeries(bookVol);
        setBookingsByCategory(categories);
        setRecentActivity(activity);
        setTopProviders(providers);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        // An expired/invalid token surfaces here as a 401/403 — force back
        // to the login screen instead of showing an empty dashboard.
        if (err instanceof services.ApiError && (err.status === 401 || err.status === 403)) {
          setIsLoggedIn(false);
        }
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);
```

Replace the `login`/`logout` callbacks:

```ts
  // ── session ──
  const login = useCallback(async (email: string, password: string) => {
    const ok = await services.login(email, password);
    if (ok) {
      const profile = services.restoreSession();
      if (profile) setAdminProfile(profile);
      setIsLoggedIn(true);
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    void services.logout();
    setIsLoggedIn(false);
    setActivePage("dashboard");
  }, []);
```

Replace the `setUserStatus` callback's parameter type:

```ts
  const setUserStatus = useCallback(
    async (id: string, status: "Active" | "Suspended") => {
      setDomainUsers(await services.setUserStatus(id, STATUS_TO_DOMAIN[status]));
    },
    [],
  );
```

- [ ] **Step 2: Verify the project still typechecks for this file's own consumers**

Run: `cd web && npx tsc --noEmit`
Expected: remaining errors should now only be in `UsersPage.tsx` and `BookingsPage.tsx` (`setUserStatus(u.id, "Banned")` calls and old `BookingStatus`/`StatusFilter` usages) — fixed in Tasks 8–9. No errors should remain in `AppContext.tsx`, `domain.ts`, `adapters/`, `api/`, `services/`, or `mock/db.ts`.

There are no automated tests for `AppContext.tsx` — the repo has no React component/context test setup, only pure-function tests under `lib/`. Manual verification happens in Task 10.

- [ ] **Step 3: Commit**

```bash
cd web
git add src/context/AppContext.tsx
git commit -m "feat(web): restore session from storage, wire real login/logout, defer data fetch until logged in"
```

---

### Task 8: Web — drop the "Banned" tier from the Users page

**Files:**
- Modify: `web/src/components/pages/UsersPage.tsx`

**Interfaces:**
- Consumes: `useApp()` → `users: UserRow[]`, `setUserStatus: (id, "Active" | "Suspended") => Promise<void>` (Task 7).

- [ ] **Step 1: Replace the file**

Replace the entire contents of `web/src/components/pages/UsersPage.tsx` with:

```tsx
"use client";

import { useState } from "react";
import { Search, CheckCircle, PauseCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import clsx from "clsx";

type RoleFilter = "all" | "provider" | "customer";

export function UsersPage() {
  const { users, setUserStatus } = useApp();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole =
      roleFilter === "all" ||
      (roleFilter === "provider" && u.isProvider) ||
      (roleFilter === "customer" && !u.isProvider);
    return matchSearch && matchRole;
  });

  const total = users.length;
  const providers = users.filter((u) => u.isProvider).length;
  const customers = users.filter((u) => !u.isProvider).length;

  return (
    <div>
      <div className="mb-4">
        <div className="text-white font-bold" style={{ fontSize: "clamp(15px, 1.5vw, 18px)" }}>User Management</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>View, manage, and moderate all registered users</div>
      </div>

      <div className="flex gap-2.5 flex-wrap mb-4">
        {[
          { icon: "👥", label: "Total Users", val: total, accent: "#6366f1", role: "all" as RoleFilter },
          { icon: "🔧", label: "Providers", val: providers, accent: "#8b5cf6", role: "provider" as RoleFilter },
          { icon: "👤", label: "Customers", val: customers, accent: "#22c55e", role: "customer" as RoleFilter },
        ].map((s) => {
          const isActive = roleFilter === s.role;
          return (
          <button
            key={s.label}
            onClick={() => setRoleFilter(s.role)}
            className="flex items-center gap-2 rounded-xl cursor-pointer transition-opacity hover:opacity-80"
            style={{ padding: "9px 14px", border: `1px solid ${s.accent}33`, background: isActive ? `${s.accent}30` : `${s.accent}18`, fontSize: 11.4, fontFamily: "inherit", outline: isActive ? `1px solid ${s.accent}55` : "none" }}
          >
            <span>{s.icon}</span>
            <span className="font-semibold text-white">{s.val}</span>
            <span style={{ color: "var(--text-muted)" }}>{s.label}</span>
          </button>
          );
        })}
      </div>

      <div className="flex gap-2.5 mb-4 flex-wrap">
        <div className="relative flex-1" style={{ minWidth: 200 }}>
          <Search size={13} className="absolute top-1/2 -translate-y-1/2 left-3 opacity-40" color="white" />
          <input
            className="w-full text-white outline-none"
            placeholder="Search by name, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: "var(--input-bg)", border: "1px solid var(--border-md)", borderRadius: 11, padding: "8px 13px 8px 32px", fontSize: 11.4, fontFamily: "inherit" }}
          />
        </div>
        <div className="inline-flex rounded-xl p-1 gap-1" style={{ background: "var(--chip-bg)" }}>
          {(["all", "provider", "customer"] as RoleFilter[]).map((f) => (
            <button key={f} onClick={() => setRoleFilter(f)}
              className={clsx("rounded-lg font-medium cursor-pointer transition-all capitalize", roleFilter === f ? "text-indigo-300" : "text-gray-500 hover:text-gray-300")}
              style={{ padding: "5px 12px", fontSize: 11.4, background: roleFilter === f ? "rgba(99,102,241,0.25)" : "transparent", border: "none", fontFamily: "inherit" }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th className="hidden md:table-cell">Joined</th>
                <th className="hidden lg:table-cell">Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div
                        className={clsx(
                          "flex items-center justify-center flex-shrink-0 font-bold",
                          u.avClass === "av-indigo" && "text-indigo-300",
                          u.avClass === "av-green" && "text-green-400",
                          u.avClass === "av-violet" && "text-violet-300"
                        )}
                        style={{ width: 29, height: 29, borderRadius: 11, fontSize: 9.8, background: u.avClass === "av-indigo" ? "rgba(99,102,241,0.2)" : u.avClass === "av-violet" ? "rgba(167,139,250,0.2)" : "rgba(34,197,94,0.15)" }}
                      >
                        {u.initials}
                      </div>
                      <div>
                        <div className="text-white font-medium" style={{ fontSize: 11.4 }}>{u.name}</div>
                        <div style={{ fontSize: 9.8, color: "var(--text-muted)" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={u.isProvider ? { background: "rgba(167,139,250,0.15)", color: "#a78bfa" } : { background: "rgba(34,197,94,0.12)", color: "var(--success-text)" }}>
                      {u.role}
                    </span>
                  </td>
                  <td><span className={clsx("badge", `badge-${u.status.toLowerCase()}`)}>{u.status}</span></td>
                  <td className="hidden md:table-cell" style={{ color: "var(--text-light)", fontSize: 11.4 }}>{u.joined}</td>
                  <td className="hidden lg:table-cell" style={{ color: "var(--text-light)", fontSize: 11.4 }}>{u.activity}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        title="Activate"
                        onClick={() => setUserStatus(u.id, "Active")}
                        disabled={u.status === "Active"}
                        className="flex items-center justify-center rounded-lg transition-colors hover:bg-white/10 disabled:opacity-30"
                        style={{ width: 26, height: 26, background: "transparent", border: "none", cursor: u.status === "Active" ? "default" : "pointer", color: "var(--success-text)" }}
                      >
                        <CheckCircle size={12} />
                      </button>
                      <button
                        title="Suspend"
                        onClick={() => setUserStatus(u.id, "Suspended")}
                        disabled={u.status === "Suspended"}
                        className="flex items-center justify-center rounded-lg transition-colors hover:bg-white/10 disabled:opacity-30"
                        style={{ width: 26, height: 26, background: "transparent", border: "none", cursor: u.status === "Suspended" ? "default" : "pointer", color: "#f59e0b" }}
                      >
                        <PauseCircle size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `cd web && npx tsc --noEmit`
Expected: remaining errors, if any, should now only be in `BookingsPage.tsx` (fixed in Task 9)

- [ ] **Step 3: Commit**

```bash
cd web
git add src/components/pages/UsersPage.tsx
git commit -m "feat(web): drop the Banned tier from the Users page (no backend support)"
```

---

### Task 9: Web — update the Bookings page status filters

**Files:**
- Modify: `web/src/components/pages/BookingsPage.tsx`

**Interfaces:**
- Consumes: `useApp()` → `bookings: BookingRow[]` where `status` is now one of the 7 real labels (`Open`, `Matching`, `Assigned`, `In Progress`, `Completed`, `Cancelled`, `Expired`) instead of the old invented set (Task 3).

- [ ] **Step 1: Replace the file**

Replace the entire contents of `web/src/components/pages/BookingsPage.tsx` with:

```tsx
"use client";

import { useState } from "react";
import { Search, XCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import clsx from "clsx";

type StatusFilter =
  | "all"
  | "Open"
  | "Matching"
  | "Assigned"
  | "In Progress"
  | "Completed"
  | "Cancelled"
  | "Expired";

const STATUS_ACCENTS: Record<StatusFilter, string> = {
  all: "#6366f1",
  Open: "#f59e0b",
  Matching: "#60a5fa",
  Assigned: "#8b5cf6",
  "In Progress": "#8b5cf6",
  Completed: "#22c55e",
  Cancelled: "#ef4444",
  Expired: "var(--danger-text)",
};

export function BookingsPage() {
  const { bookings, cancelBooking } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.toLowerCase().includes(search.toLowerCase()) ||
      b.service.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts: Record<StatusFilter, number> = {
    all: bookings.length,
    Open: bookings.filter((b) => b.status === "Open").length,
    Matching: bookings.filter((b) => b.status === "Matching").length,
    Assigned: bookings.filter((b) => b.status === "Assigned").length,
    "In Progress": bookings.filter((b) => b.status === "In Progress").length,
    Completed: bookings.filter((b) => b.status === "Completed").length,
    Cancelled: bookings.filter((b) => b.status === "Cancelled").length,
    Expired: bookings.filter((b) => b.status === "Expired").length,
  };

  return (
    <div>
      <div className="mb-4">
        <div className="text-white font-bold" style={{ fontSize: "clamp(15px, 1.5vw, 18px)" }}>Bookings</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Track all service bookings across the platform</div>
      </div>

      <div className="flex gap-2.5 flex-wrap mb-4">
        {(["all", "Open", "Matching", "Assigned", "In Progress", "Completed", "Cancelled", "Expired"] as StatusFilter[]).map((s) => {
          const accent = STATUS_ACCENTS[s];
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="flex items-center gap-2 rounded-xl cursor-pointer transition-opacity hover:opacity-80"
              style={{ padding: "9px 14px", border: `1px solid ${accent}33`, background: statusFilter === s ? `${accent}28` : `${accent}18`, fontSize: 11.4, fontFamily: "inherit", outline: statusFilter === s ? `1px solid ${accent}44` : "none" }}
            >
              <span className="font-semibold text-white">{counts[s]}</span>
              <span style={{ color: "var(--text-muted)" }}>{s === "all" ? "Total" : s}</span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2.5 mb-4">
        <div className="relative flex-1">
          <Search size={13} className="absolute top-1/2 -translate-y-1/2 left-3 opacity-40" color="white" />
          <input
            className="w-full text-white outline-none"
            placeholder="Search by booking ID, customer, or service…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: "var(--input-bg)", border: "1px solid var(--border-md)", borderRadius: 11, padding: "8px 13px 8px 32px", fontSize: 11.4, fontFamily: "inherit" }}
          />
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th className="hidden md:table-cell">Provider</th>
                <th className="hidden lg:table-cell">Service</th>
                <th>Status</th>
                <th className="hidden md:table-cell">Date</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td style={{ color: "var(--indigo-light)", fontFamily: "monospace", fontSize: 11 }}>{b.id}</td>
                  <td className="text-white">{b.customer}</td>
                  <td className="hidden md:table-cell" style={{ color: "var(--text-light)" }}>{b.provider}</td>
                  <td className="hidden lg:table-cell" style={{ color: "var(--text-light)" }}>{b.service}</td>
                  <td><span className={clsx("badge", b.statusClass)}>{b.status}</span></td>
                  <td className="hidden md:table-cell" style={{ color: "var(--text-light)" }}>{b.date}</td>
                  <td className="text-white font-semibold">{b.amount}</td>
                  <td>
                    {b.cancellable && (
                      <button
                        onClick={() => cancelBooking(b.id)}
                        title="Cancel booking"
                        className="flex items-center gap-1 font-medium transition-colors hover:opacity-80"
                        style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "4px 10px", fontSize: 10, color: "var(--danger-text)", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        <XCircle size={10} /> Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Full project verification**

Run: `cd web && npx tsc --noEmit && npx eslint src && npx vitest run`
Expected: no type errors, no lint errors, all tests pass

- [ ] **Step 3: Commit**

```bash
cd web
git add src/components/pages/BookingsPage.tsx
git commit -m "feat(web): update Bookings page status filters for the real job_status set"
```

---

### Task 10: Local end-to-end verification against the live backend

**Files:**
- Create: `web/.env.local` (not committed — already covered by `.env*` in `.gitignore`)

**Interfaces:**
- None — this task only verifies Tasks 1–9 work together against the real, live Render backend.

- [ ] **Step 1: Create the local env file**

Create `web/.env.local`:

```
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_URL=https://taskbuddy-1d48.onrender.com
```

- [ ] **Step 2: Confirm backend Task 1 has actually reached the live backend**

Task 1's endpoint only exists locally until `feat/admin-module`-style branch is merged and Render redeploys (same as the original admin module). Run: `git log --oneline -1` in `backend/`, then push the branch and open/merge a PR the same way the original admin module PR was handled (see prior conversation), and wait for the Render redeploy to finish before continuing — check `https://taskbuddy-1d48.onrender.com/health` reflects a fresh deploy, or simply retry Step 5 below until the cancel button works.

- [ ] **Step 3: Start the web app locally**

Run: `cd web && npm run dev`
Expected: server starts on `http://localhost:3000`

- [ ] **Step 4: Manual smoke test — Login**

In a browser, open `http://localhost:3000`. Log in with the real admin account created earlier (e.g. the one promoted to `role = 'admin'` in Supabase).
Expected: login succeeds and the dashboard loads (no console errors about `ApiError`); refreshing the page keeps you logged in (session restored from `localStorage`).

- [ ] **Step 5: Manual smoke test — Users**

Navigate to Users. Search for a known user, suspend them, confirm the badge flips to "Suspended" and the Activate button becomes enabled. Reinstate them back to Active.
Expected: both actions succeed and the table refreshes with the real updated status.

- [ ] **Step 6: Manual smoke test — Bookings**

Navigate to Bookings. Confirm real jobs appear with real statuses (Open/Matching/Assigned/In Progress/Completed/Cancelled/Expired). Cancel a booking that's still cancellable.
Expected: the booking's status flips to "Cancelled" and its Cancel button disappears.

- [ ] **Step 7: Manual smoke test — Reports**

Navigate to Reports. Confirm the stat tiles, category pie chart, monthly bookings bar chart, and top providers list show real numbers matching what you saw on Users/Bookings (e.g. total bookings count matches).
Expected: no loading spinner stuck forever, no `NaN`/`undefined` rendered anywhere.

- [ ] **Step 8: Confirm Verifications/Transactions are still mocked (unchanged)**

Navigate to Verifications and Transactions.
Expected: same mock data as before this plan — approving/rejecting a verification still works exactly as it did previously.

---

### Task 11: Deploy `web/` to Vercel

**Files:** none (external service configuration)

**Interfaces:** none

- [ ] **Step 1: Push the branch**

```bash
cd D:/Thesis/taskbuddy
git push origin <branch-name>
```

- [ ] **Step 2: Create the Vercel project** (manual — requires your Vercel account)

In the Vercel dashboard: "Add New… → Project", import the GitHub repo, and set:
- **Root Directory:** `web`
- **Framework Preset:** Next.js (should auto-detect)

- [ ] **Step 3: Set environment variables** (manual, in Vercel's project settings → Environment Variables)

```
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_URL=https://taskbuddy-1d48.onrender.com
```

- [ ] **Step 4: Deploy and verify**

Trigger the deploy (Vercel does this automatically on push once connected). Once live, repeat the manual smoke tests from Task 10 (Steps 4–8) against the deployed Vercel URL instead of `localhost:3000`.
Expected: identical behavior to the local run — real login, real Users/Bookings/Reports, mocked Verifications/Transactions.

---

### Task 12: Update project docs

**Files:**
- Modify: `web/README.md`
- Modify: `web/.notes/PROJECT_LOG.md`

- [ ] **Step 1: Update `web/README.md`**

In the "Connecting the Real Backend" section, replace the forward-looking instructions with a statement of current status. Find this text:

```
## Connecting the Real Backend

When `apps/backend` ships its admin endpoints:

1. Set the environment variables:
   ```bash
   NEXT_PUBLIC_USE_MOCK=false
   NEXT_PUBLIC_API_URL=http://localhost:3001   # or the deployed API URL
   ```
2. In `src/lib/services/index.ts`, replace each function body with the one-line `client` call already noted in its `// later:` comment.
3. Nothing else changes — domain types, adapters, context, and every page keep working as-is.
```

Replace it with:

```
## Real Backend Integration

Login, Users, Bookings, and Reports/Analytics call the live backend
(`https://taskbuddy-1d48.onrender.com` by default — override with
`NEXT_PUBLIC_API_URL`). Verifications and Transactions still run on mock
data (`src/lib/mock/db.ts`) — no backend tables exist for those yet; see
`docs/superpowers/specs/2026-07-20-web-backend-integration-design.md` for
the full rationale.

To run against a different backend URL (e.g. a local `backend/` instance):

```bash
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_URL=http://localhost:3001
```
```

- [ ] **Step 2: Add a PROJECT_LOG.md entry**

Read the current top of `web/.notes/PROJECT_LOG.md` first to match its existing entry format and date-heading style, then add a new dated entry above the prior "Latest Update" summarizing: domain types corrected to match real backend enums, Login/Users/Bookings/Reports wired to the live backend, new backend cancel-booking endpoint, Verifications/Transactions/revenue/booking-amount deliberately left mocked (with why), and the Vercel deployment.

- [ ] **Step 3: Commit**

```bash
cd web
git add README.md .notes/PROJECT_LOG.md
git commit -m "docs(web): update README and project log for the real backend integration"
```
