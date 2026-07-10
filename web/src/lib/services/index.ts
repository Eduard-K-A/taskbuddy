// ─── Services: the data seam ──────────────────────────────────────────────────
// Pages/context call these and never know where data comes from. Today every
// function reads the in-memory mock DB; when the backend lands, each body
// becomes a one-line `client.get/post/patch(...)` call (see api/client.ts).

import * as db from "@/lib/mock/db";
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

/** Small artificial latency so the UI's loading path is actually exercised. */
const simulate = <T>(data: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), 150));

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<boolean> {
  // later: client.post("/admin/auth/login", { email, password })
  return simulate(email === db.credentials.email && password === db.credentials.password);
}

export async function changePassword(current: string, next: string): Promise<boolean> {
  // later: client.post("/admin/auth/change-password", { current, next })
  if (current !== db.credentials.password) return simulate(false);
  db.credentials.password = next;
  return simulate(true);
}

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<AdminUser[]> {
  // later: client.get("/admin/users")
  return simulate([...db.users]);
}

export async function getVerifications(): Promise<Verification[]> {
  // later: client.get("/admin/verifications")
  return simulate([...db.verifications]);
}

export async function getTransactions(): Promise<Transaction[]> {
  // later: client.get("/admin/transactions")
  return simulate([...db.transactions]);
}

export async function getBookings(): Promise<AdminBooking[]> {
  // later: client.get("/admin/bookings")
  return simulate([...db.bookings]);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  // later: client.get("/admin/stats")
  return simulate({
    ...db.stats,
    pendingVerifications: db.verifications.filter((v) => v.status === "PENDING").length,
  });
}

export async function getRevenueSeries(): Promise<MonthlyPoint[]> {
  return simulate([...db.revenueSeries]);
}

export async function getBookingsSeries(): Promise<MonthlyPoint[]> {
  return simulate([...db.bookingsSeries]);
}

export async function getBookingsByCategory(): Promise<CategoryShare[]> {
  return simulate([...db.bookingsByCategory]);
}

export async function getRecentActivity(): Promise<ActivityEvent[]> {
  return simulate([...db.recentActivity]);
}

export async function getTopProviders(): Promise<TopProvider[]> {
  return simulate([...db.topProviders]);
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function approveVerification(id: string): Promise<Verification[]> {
  // later: client.patch(`/admin/verifications/${id}`, { status: "APPROVED" })
  const v = db.verifications.find((x) => x.id === id);
  if (v) v.status = "APPROVED";
  return simulate([...db.verifications]);
}

export async function rejectVerification(id: string): Promise<Verification[]> {
  // later: client.patch(`/admin/verifications/${id}`, { status: "REJECTED" })
  const v = db.verifications.find((x) => x.id === id);
  if (v) v.status = "REJECTED";
  return simulate([...db.verifications]);
}

export async function setUserStatus(id: string, status: UserStatus): Promise<AdminUser[]> {
  // later: client.patch(`/admin/users/${id}`, { status })
  const u = db.users.find((x) => x.id === id);
  if (u) u.status = status;
  return simulate([...db.users]);
}

export async function cancelBooking(id: string): Promise<AdminBooking[]> {
  // later: client.patch(`/admin/bookings/${id}`, { status: "CANCELLED" })
  const b = db.bookings.find((x) => x.id === id);
  if (b) b.status = "CANCELLED";
  return simulate([...db.bookings]);
}
