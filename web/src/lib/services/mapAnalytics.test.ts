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
