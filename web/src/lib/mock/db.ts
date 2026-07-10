// ─── Mock database ────────────────────────────────────────────────────────────
// An in-memory stand-in for the real backend. The services layer is the ONLY
// consumer; nothing else may import from here. When the backend exists this
// whole folder is deleted and services point at the API client instead.

import type {
  AdminBooking,
  AdminUser,
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

export const adminProfile = {
  name: "Super Admin",
  email: "admin@taskbuddy.io",
};

export const users: AdminUser[] = [
  { id: "u-001", email: "morgan@example.com",  role: "provider",  createdAt: "2024-03-10", name: "Morgan Lee",   status: "ACTIVE",    jobsCompleted: 21, rating: 4.9 },
  { id: "u-002", email: "j.kim@example.com",   role: "homeowner", createdAt: "2024-02-22", name: "Jamie Kim",    status: "ACTIVE",    jobsCompleted: 8,  rating: null },
  { id: "u-003", email: "c.morgan@example.com", role: "homeowner", createdAt: "2024-01-14", name: "Casey Morgan", status: "SUSPENDED", jobsCompleted: 3,  rating: null },
  { id: "u-004", email: "riley@example.com",   role: "provider",  createdAt: "2024-04-01", name: "Riley Cooper", status: "ACTIVE",    jobsCompleted: 15, rating: 4.6 },
  { id: "u-005", email: "sam.t@example.com",   role: "homeowner", createdAt: "2024-02-05", name: "Sam Taylor",   status: "BANNED",    jobsCompleted: 1,  rating: null },
  { id: "u-006", email: "j.blake@example.com", role: "provider",  createdAt: "2024-03-20", name: "Jordan Blake", status: "ACTIVE",    jobsCompleted: 18, rating: 4.7 },
  { id: "u-007", email: "p.morgan@example.com", role: "provider", createdAt: "2024-03-15", name: "Pat Morgan",   status: "ACTIVE",    jobsCompleted: 25, rating: 4.8 },
  { id: "u-008", email: "c.kim@example.com",   role: "provider",  createdAt: "2024-02-28", name: "Chris Kim",    status: "ACTIVE",    jobsCompleted: 11, rating: 4.5 },
  { id: "u-009", email: "j.ross@example.com",  role: "provider",  createdAt: "2024-03-05", name: "Jamie Ross",   status: "ACTIVE",    jobsCompleted: 29, rating: 4.8 },
  { id: "u-010", email: "alex@example.com",    role: "homeowner", createdAt: "2024-03-01", name: "Alex Chen",    status: "ACTIVE",    jobsCompleted: 12, rating: null },
];

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

// Note: BK-0088 is DISPUTED to stay coherent with the activity feed
// ("Dispute raised on BK-0088") and TXN-004 (same job, disputed).
export const bookings: AdminBooking[] = [
  { id: "BK-0092", customerName: "Jamie Kim",    providerName: "Riley Cooper",   service: "Aircon Repair",    status: "PENDING",     scheduledDate: "2026-04-16", amount: 1350 },
  { id: "BK-0091", customerName: "Morgan Lee",   providerName: "Sofia Martinez", service: "House Cleaning",   status: "COMPLETED",   scheduledDate: "2026-04-10", amount: 1200 },
  { id: "BK-0090", customerName: "Jamie Kim",    providerName: "Pat Morgan",     service: "Plumbing Repair",  status: "CONFIRMED",   scheduledDate: "2026-04-12", amount: 850 },
  { id: "BK-0089", customerName: "Casey Morgan", providerName: "Dana Lee",       service: "Electrical Work",  status: "COMPLETED",   scheduledDate: "2026-04-14", amount: 2100 },
  { id: "BK-0088", customerName: "Riley Cooper", providerName: "Jamie Ross",     service: "Furniture Repair", status: "DISPUTED",    scheduledDate: "2026-04-08", amount: 1500 },
  { id: "BK-0087", customerName: "Sam Taylor",   providerName: "Marcus Rivera",  service: "Painting",         status: "COMPLETED",   scheduledDate: "2026-04-06", amount: 3400 },
  { id: "BK-0086", customerName: "Jordan Blake", providerName: "Chris Kim",      service: "Landscaping",      status: "IN_PROGRESS", scheduledDate: "2026-04-04", amount: 980 },
  { id: "BK-0085", customerName: "Alex Chen",    providerName: "Sofia Martinez", service: "House Cleaning",   status: "COMPLETED",   scheduledDate: "2026-04-02", amount: 1200 },
];

// Platform-scale stats (the sample rows above are a window, not the whole
// platform). pendingVerifications is computed live in the services layer.
export const stats = {
  totalUsers: 1284,
  activeProviders: 342,
  totalBookings: 8921,
  totalRevenue: 2_400_000,
  monthlyRevenue: 184_200,
  completionRate: 94.2,
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

export const bookingsSeries: MonthlyPoint[] = [
  { month: "Oct", value: 820 },
  { month: "Nov", value: 950 },
  { month: "Dec", value: 1280 },
  { month: "Jan", value: 910 },
  { month: "Feb", value: 1430 },
  { month: "Mar", value: 1670 },
  { month: "Apr", value: 1842 },
];

export const bookingsByCategory: CategoryShare[] = [
  { label: "Cleaning", value: 32 },
  { label: "Plumbing", value: 18 },
  { label: "Electrical", value: 15 },
  { label: "Carpentry", value: 12 },
  { label: "Painting", value: 14 },
  { label: "Others", value: 9 },
];

export const recentActivity: ActivityEvent[] = [
  { time: "2m ago",  text: "Morgan Lee submitted verification docs",   type: "verif" },
  { time: "15m ago", text: "Transaction TXN-007 marked Completed",     type: "tx" },
  { time: "1h ago",  text: "New user Alex Chen registered",            type: "user" },
  { time: "2h ago",  text: "Dispute raised on BK-0088",                type: "alert" },
  { time: "3h ago",  text: "Sam Taylor's account suspended",           type: "alert" },
  { time: "5h ago",  text: "Pat Morgan completed 25th job",            type: "user" },
];

export const topProviders: TopProvider[] = [
  { name: "Marcus Rivera",  jobs: 38, rating: 4.9 },
  { name: "Sofia Martinez", jobs: 34, rating: 4.7 },
  { name: "Jamie Ross",     jobs: 29, rating: 4.8 },
  { name: "Pat Morgan",     jobs: 25, rating: 4.8 },
  { name: "Jordan Blake",   jobs: 18, rating: 4.7 },
];
