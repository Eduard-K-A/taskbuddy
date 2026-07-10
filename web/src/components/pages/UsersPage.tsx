"use client";

import { useState } from "react";
import { Search, CheckCircle, Ban, PauseCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import clsx from "clsx";

type RoleFilter = "all" | "provider" | "customer";
type StatusFilter = "all" | "banned";

export function UsersPage() {
  const { users, setUserStatus } = useApp();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole =
      roleFilter === "all" ||
      (roleFilter === "provider" && u.isProvider) ||
      (roleFilter === "customer" && !u.isProvider);
    const matchStatus = statusFilter === "all" || u.status === "Banned";
    return matchSearch && matchRole && matchStatus;
  });

  const total = users.length;
  const providers = users.filter((u) => u.isProvider).length;
  const customers = users.filter((u) => !u.isProvider).length;
  const banned = users.filter((u) => u.status === "Banned").length;

  return (
    <div>
      <div className="mb-4">
        <div className="text-white font-bold" style={{ fontSize: "clamp(15px, 1.5vw, 18px)" }}>User Management</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>View, manage, and moderate all registered users</div>
      </div>

      <div className="flex gap-2.5 flex-wrap mb-4">
        {[
          { icon: "👥", label: "Total Users", val: total, accent: "#6366f1", role: "all" as RoleFilter, status: "all" as StatusFilter },
          { icon: "🔧", label: "Providers", val: providers, accent: "#8b5cf6", role: "provider" as RoleFilter, status: "all" as StatusFilter },
          { icon: "👤", label: "Customers", val: customers, accent: "#22c55e", role: "customer" as RoleFilter, status: "all" as StatusFilter },
          { icon: "🚫", label: "Banned", val: banned, accent: "#ef4444", role: "all" as RoleFilter, status: "banned" as StatusFilter },
        ].map((s) => {
          const isActive = roleFilter === s.role && statusFilter === s.status;
          return (
          <button
            key={s.label}
            onClick={() => { setRoleFilter(s.role); setStatusFilter(s.status); }}
            className="flex items-center gap-2 rounded-xl cursor-pointer transition-opacity hover:opacity-80"
            style={{ padding: "9px 14px", border: `1px solid ${s.accent}33`, background: isActive ? `${s.accent}30` : `${s.accent}18`, fontSize: 11.4, fontFamily: "inherit", outline: isActive ? `1px solid ${s.accent}55` : "none" }}
          >
            <span>{s.icon}</span>
            <span className="font-semibold text-white">{s.val}</span>
            <span style={{ color: "var(--text-muted)" }}>{s.label}</span>
          </button>
          );
        })}
      </div>

      <div className="flex gap-2.5 mb-4 flex-wrap">
        <div className="relative flex-1" style={{ minWidth: 200 }}>
          <Search size={13} className="absolute top-1/2 -translate-y-1/2 left-3 opacity-40" color="white" />
          <input
            className="w-full text-white outline-none"
            placeholder="Search by name, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: "var(--input-bg)", border: "1px solid var(--border-md)", borderRadius: 11, padding: "8px 13px 8px 32px", fontSize: 11.4, fontFamily: "inherit" }}
          />
        </div>
        <div className="inline-flex rounded-xl p-1 gap-1" style={{ background: "var(--chip-bg)" }}>
          {(["all", "provider", "customer"] as RoleFilter[]).map((f) => (
            <button key={f} onClick={() => { setRoleFilter(f); setStatusFilter("all"); }}
              className={clsx("rounded-lg font-medium cursor-pointer transition-all capitalize", roleFilter === f ? "text-indigo-300" : "text-gray-500 hover:text-gray-300")}
              style={{ padding: "5px 12px", fontSize: 11.4, background: roleFilter === f ? "rgba(99,102,241,0.25)" : "transparent", border: "none", fontFamily: "inherit" }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th className="hidden md:table-cell">Joined</th>
                <th className="hidden lg:table-cell">Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div
                        className={clsx(
                          "flex items-center justify-center flex-shrink-0 font-bold",
                          u.avClass === "av-indigo" && "text-indigo-300",
                          u.avClass === "av-green" && "text-green-400",
                          u.avClass === "av-violet" && "text-violet-300"
                        )}
                        style={{ width: 29, height: 29, borderRadius: 11, fontSize: 9.8, background: u.avClass === "av-indigo" ? "rgba(99,102,241,0.2)" : u.avClass === "av-violet" ? "rgba(167,139,250,0.2)" : "rgba(34,197,94,0.15)" }}
                      >
                        {u.initials}
                      </div>
                      <div>
                        <div className="text-white font-medium" style={{ fontSize: 11.4 }}>{u.name}</div>
                        <div style={{ fontSize: 9.8, color: "var(--text-muted)" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={u.isProvider ? { background: "rgba(167,139,250,0.15)", color: "#a78bfa" } : { background: "rgba(34,197,94,0.12)", color: "var(--success-text)" }}>
                      {u.role}
                    </span>
                  </td>
                  <td><span className={clsx("badge", `badge-${u.status.toLowerCase()}`)}>{u.status}</span></td>
                  <td className="hidden md:table-cell" style={{ color: "var(--text-light)", fontSize: 11.4 }}>{u.joined}</td>
                  <td className="hidden lg:table-cell" style={{ color: "var(--text-light)", fontSize: 11.4 }}>{u.activity}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        title="Activate"
                        onClick={() => setUserStatus(u.id, "Active")}
                        disabled={u.status === "Active"}
                        className="flex items-center justify-center rounded-lg transition-colors hover:bg-white/10 disabled:opacity-30"
                        style={{ width: 26, height: 26, background: "transparent", border: "none", cursor: u.status === "Active" ? "default" : "pointer", color: "var(--success-text)" }}
                      >
                        <CheckCircle size={12} />
                      </button>
                      <button
                        title="Suspend"
                        onClick={() => setUserStatus(u.id, "Suspended")}
                        disabled={u.status === "Suspended"}
                        className="flex items-center justify-center rounded-lg transition-colors hover:bg-white/10 disabled:opacity-30"
                        style={{ width: 26, height: 26, background: "transparent", border: "none", cursor: u.status === "Suspended" ? "default" : "pointer", color: "#f59e0b" }}
                      >
                        <PauseCircle size={12} />
                      </button>
                      <button
                        title="Ban"
                        onClick={() => setUserStatus(u.id, "Banned")}
                        disabled={u.status === "Banned"}
                        className="flex items-center justify-center rounded-lg transition-colors hover:bg-white/10 disabled:opacity-30"
                        style={{ width: 26, height: 26, background: "transparent", border: "none", cursor: u.status === "Banned" ? "default" : "pointer", color: "var(--danger-text)" }}
                      >
                        <Ban size={12} />
                      </button>
                    </div>
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
