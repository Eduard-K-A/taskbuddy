"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useApp } from "@/context/AppContext";
import clsx from "clsx";

type StatusFilter = "all" | "Completed" | "In Escrow" | "Disputed" | "Refunded";

export function TransactionsPage() {
  const { transactions } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = transactions.filter((t) => {
    const matchSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.customer.toLowerCase().includes(search.toLowerCase()) ||
      t.provider.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const total = transactions.reduce((s, t) => s + t.amountValue, 0);

  return (
    <div>
      <div className="mb-4">
        <div className="text-white font-bold" style={{ fontSize: "clamp(15px, 1.5vw, 18px)" }}>Transactions</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Monitor all platform transactions and escrow payments</div>
      </div>

      <div className="flex gap-2.5 flex-wrap mb-4">
        {[
          { label: "Total Transactions", val: transactions.length, accent: "#6366f1" },
          { label: "Total Volume", val: `₱${total.toLocaleString()}`, accent: "#22c55e" },
          { label: "Completed", val: transactions.filter((t) => t.status === "Completed").length, accent: "var(--success-text)" },
          { label: "Disputed", val: transactions.filter((t) => t.status === "Disputed").length, accent: "#ef4444" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 rounded-xl" style={{ padding: "9px 14px", border: `1px solid ${s.accent}33`, background: `${s.accent}18`, fontSize: 11.4 }}>
            <span className="font-semibold text-white">{s.val}</span>
            <span style={{ color: "var(--text-muted)" }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2.5 mb-4 flex-wrap">
        <div className="relative flex-1" style={{ minWidth: 200 }}>
          <Search size={13} className="absolute top-1/2 -translate-y-1/2 left-3 opacity-40" color="white" />
          <input
            className="w-full text-white outline-none"
            placeholder="Search by ID, customer, or provider…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: "var(--input-bg)", border: "1px solid var(--border-md)", borderRadius: 11, padding: "8px 13px 8px 32px", fontSize: 11.4, fontFamily: "inherit" }}
          />
        </div>
        <div className="inline-flex rounded-xl p-1 gap-1 flex-wrap" style={{ background: "var(--chip-bg)" }}>
          {(["all", "Completed", "In Escrow", "Disputed", "Refunded"] as StatusFilter[]).map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={clsx("rounded-lg font-medium cursor-pointer transition-all", statusFilter === f ? "text-indigo-300" : "text-gray-500 hover:text-gray-300")}
              style={{ padding: "5px 10px", fontSize: 10.5, background: statusFilter === f ? "rgba(99,102,241,0.25)" : "transparent", border: "none", fontFamily: "inherit", whiteSpace: "nowrap" }}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th className="hidden md:table-cell">Provider</th>
                <th className="hidden lg:table-cell">Service</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td style={{ color: "var(--indigo-light)", fontFamily: "monospace", fontSize: 11 }}>{t.id}</td>
                  <td className="text-white">{t.customer}</td>
                  <td className="hidden md:table-cell" style={{ color: "var(--text-light)" }}>{t.provider}</td>
                  <td className="hidden lg:table-cell" style={{ color: "var(--text-light)" }}>{t.service}</td>
                  <td className="text-white font-semibold">{t.amount}</td>
                  <td><span className={clsx("badge", t.statusClass)}>{t.status}</span></td>
                  <td className="hidden md:table-cell" style={{ color: "var(--text-light)" }}>{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
