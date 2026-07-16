// ─── Domain types ─────────────────────────────────────────────────────────────
// "Backend-shaped" data: numbers, enums, ISO dates. SharedUser/SharedBooking
// are the platform-wide contracts (formerly @taskbuddy/shared-types, inlined
// here when that workspace package was removed in the repo restructure);
// admin-only types extend them until the backend defines authoritative
// versions.

interface SharedUser {
  id: string;
  email: string;
  role: "homeowner" | "provider" | "admin";
  createdAt: string;
}

interface SharedBooking {
  id: string;
  customerId: string;
  providerId: string;
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED_PENDING_CONFIRMATION" | "COMPLETED" | "CANCELLED" | "DISPUTED";
  serviceCategory: string;
  scheduledDate: string;
  amount: number;
}

export type Page =
  | "dashboard"
  | "verifications"
  | "users"
  | "transactions"
  | "bookings"
  | "reports"
  | "settings";

// ─── Users ────────────────────────────────────────────────────────────────────

export type UserRole = SharedUser["role"]; // "homeowner" | "provider" | "admin"
export type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED";

/** Admin view of a user: the shared User plus moderation/activity fields the
 *  admin endpoints will return joined-in. */
export interface AdminUser extends SharedUser {
  name: string;
  status: UserStatus;
  jobsCompleted: number;
  /** Provider average rating; null for customers. */
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

/** Status enum comes straight from the shared Booking contract the mobile app
 *  will produce. */
export type BookingStatus = SharedBooking["status"];

export interface AdminBooking {
  id: string;
  customerName: string;
  providerName: string;
  service: string;
  status: BookingStatus;
  scheduledDate: string; // ISO date
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
