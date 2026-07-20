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
