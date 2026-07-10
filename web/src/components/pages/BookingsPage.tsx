"use client";

import { useState } from "react";
import { Search, XCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import clsx from "clsx";

type StatusFilter = "all" | "Pending" | "Active" | "Completed" | "Cancelled" | "Disputed";

const STATUS_ACCENTS: Record<StatusFilter, string> = {
  all: "#6366f1",
  Pending: "#f59e0b",
  Active: "#8b5cf6",
  Completed: "#22c55e",
  Cancelled: "#ef4444",
  Disputed: "var(--danger-text)",
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
    Pending: bookings.filter((b) => b.status === "Pending").length,
    Active: bookings.filter((b) => b.status === "Active").length,
    Completed: bookings.filter((b) => b.status === "Completed").length,
    Cancelled: bookings.filter((b) => b.status === "Cancelled").length,
    Disputed: bookings.filter((b) => b.status === "Disputed").length,
  };

  return (
    <div>
      <div className="mb-4">
        <div className="text-white font-bold" style={{ fontSize: "clamp(15px, 1.5vw, 18px)" }}>Bookings</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Track all service bookings across the platform</div>
      </div>

      <div className="flex gap-2.5 flex-wrap mb-4">
        {(["all", "Pending", "Active", "Completed", "Cancelled", "Disputed"] as StatusFilter[]).map((s) => {
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
