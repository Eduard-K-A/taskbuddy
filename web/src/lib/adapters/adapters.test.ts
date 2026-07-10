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
  it("groups in-flight statuses as Active", () => {
    expect(BOOKING_STATUS_DISPLAY.CONFIRMED.label).toBe("Active");
    expect(BOOKING_STATUS_DISPLAY.IN_PROGRESS.label).toBe("Active");
    expect(BOOKING_STATUS_DISPLAY.COMPLETED_PENDING_CONFIRMATION.label).toBe("Active");
  });
  it("only allows cancelling bookings still in flight", () => {
    expect(isCancellableBooking("PENDING")).toBe(true);
    expect(isCancellableBooking("CONFIRMED")).toBe(true);
    expect(isCancellableBooking("COMPLETED")).toBe(false);
    expect(isCancellableBooking("DISPUTED")).toBe(false);
    expect(isCancellableBooking("CANCELLED")).toBe(false);
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

  it("maps a customer without rating", () => {
    const u: AdminUser = {
      id: "u-002", email: "j.kim@example.com", role: "homeowner",
      createdAt: "2024-02-22", name: "Jamie Kim", status: "BANNED",
      jobsCompleted: 1, rating: null,
    };
    const row = toUserRow(u);
    expect(row.role).toBe("👤 Customer");
    expect(row.avClass).toBe("av-green");
    expect(row.activity).toBe("1 job");
    expect(row.statusClass).toBe("badge-banned");
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
      service: "Plumbing Repair", status: "CONFIRMED",
      scheduledDate: "2026-04-12", amount: 850,
    };
    const row = toBookingRow(b);
    expect(row.status).toBe("Active");
    expect(row.cancellable).toBe(true);
    expect(toBookingRow({ ...b, status: "DISPUTED" }).cancellable).toBe(false);
  });
});
