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
  BANNED:    { label: "Banned",    badgeClass: "badge-banned" },
};

export const TRANSACTION_STATUS_DISPLAY: Record<TransactionStatus, { label: string; badgeClass: string }> = {
  COMPLETED: { label: "Completed", badgeClass: "badge-completed" },
  IN_ESCROW: { label: "In Escrow", badgeClass: "badge-processing" },
  DISPUTED:  { label: "Disputed",  badgeClass: "badge-rejected" },
  REFUNDED:  { label: "Refunded",  badgeClass: "badge-refunded" },
};

/** Groups the mobile app's granular booking statuses into the admin view.
 *  CONFIRMED / IN_PROGRESS / COMPLETED_PENDING_CONFIRMATION all read as
 *  "Active" work-in-flight to an admin. */
export const BOOKING_STATUS_DISPLAY: Record<BookingStatus, { label: string; badgeClass: string }> = {
  PENDING:                          { label: "Pending",   badgeClass: "badge-pending" },
  CONFIRMED:                        { label: "Active",    badgeClass: "badge-active" },
  IN_PROGRESS:                      { label: "Active",    badgeClass: "badge-active" },
  COMPLETED_PENDING_CONFIRMATION:   { label: "Active",    badgeClass: "badge-active" },
  COMPLETED:                        { label: "Completed", badgeClass: "badge-completed" },
  CANCELLED:                        { label: "Cancelled", badgeClass: "badge-cancelled" },
  DISPUTED:                         { label: "Disputed",  badgeClass: "badge-rejected" },
};

/** Bookings an admin can still cancel. */
export function isCancellableBooking(status: BookingStatus): boolean {
  return status === "PENDING" || status === "CONFIRMED" || status === "IN_PROGRESS";
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
