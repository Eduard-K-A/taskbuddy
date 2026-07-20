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
