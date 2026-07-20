// ─── Mock database ────────────────────────────────────────────────────────────
// An in-memory stand-in for data with no real backend yet. Only consumed by
// the services layer for Verifications/Transactions, revenue, and a few
// dashboard-only figures — everything else (Users, Bookings, most of
// analytics) now reads the real backend; see lib/services/index.ts.

import type {
  ActivityEvent,
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
