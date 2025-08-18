// GroupListPage.jsx (UI rebuilt to match comps)
// Notes:
// - NavBar is imported/handled elsewhere. This file renders only the page body.
// - Uses your existing Zustand stores: useGroupStore, useAuthStore.
// - Includes List/Grid toggle, search, basic filters, and a floating "+" action.
// - TailwindCSS required.

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiGrid,
  FiList,
  FiUsers,
  FiCalendar,
  FiClock,
  FiMoreHorizontal,
  FiPlus,
} from "react-icons/fi";
import useGroupStore from "../Store/group";
import useAuthStore from "../Store/Auth";

const COLORS = {
  brand: "#2563eb", // blue-600
  brandSoft: "#e5efff",
  ink: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  bg: "#f8fafc",
};

export default function GroupListPage() {
  const {
    groups = [],
    loading,
    error,
    successMessage,
    fetchUserGroups,
    joinGroup,
    clearError,
    clearSuccessMessage,
  } = useGroupStore();
  const { user: currentUser } = useAuthStore();

  // fetch
  useEffect(() => {
    if (currentUser?._id) fetchUserGroups();
  }, [currentUser, fetchUserGroups]);

  // UI state
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [freqFilter, setFreqFilter] = useState("All");
  const [view, setView] = useState("list"); // 'list' | 'grid'

  const filtered = useMemo(() => {
    let rows = Array.isArray(groups) ? groups : [];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((g) =>
        [g.name, g.description, g.admin?.email]
          .filter(Boolean)
          .some((t) => String(t).toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "All") {
      rows = rows.filter((g) => (g.status || "").toLowerCase() === statusFilter.toLowerCase());
    }

    if (freqFilter !== "All") {
      rows = rows.filter((g) => (g.frequency || "").toLowerCase() === freqFilter.toLowerCase());
    }

    return rows;
  }, [groups, query, statusFilter, freqFilter]);

  const handleJoin = async (groupId) => {
    try {
      await joinGroup(groupId);
      // optional toast; relying on successMessage from store
    } catch (e) {
      // rely on error from store
      console.error(e);
    }
  };

  return (
    <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-slate-900">Investment Groups</h1>
        <p className="text-sm text-slate-500 mt-1">Discover and join investment groups that match your goals</p>
      </div>

      {/* Search + Filters + View Toggle */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Groups."
              className="w-full pl-10 pr-24 h-10 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
            />
            {/* View toggle */}
            <div className="absolute right-2 inset-y-0 flex items-center gap-1">
              <button
                aria-label="List view"
                onClick={() => setView("list")}
                className={`p-2 rounded-md border ${
                  view === "list" ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-slate-200 text-slate-500"
                } hover:bg-slate-50`}
              >
                <FiList />
              </button>
              <button
                aria-label="Grid view"
                onClick={() => setView("grid")}
                className={`p-2 rounded-md border ${
                  view === "grid" ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-slate-200 text-slate-500"
                } hover:bg-slate-50`}
              >
                <FiGrid />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Select
              label="All"
              value={statusFilter}
              onChange={setStatusFilter}
              options={["All", "active", "inactive", "paused", "completed"]}
            />
            <Select
              label="All"
              value={freqFilter}
              onChange={setFreqFilter}
              options={["All", "daily", "weekly", "biweekly", "monthly"]}
            />
          </div>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-slate-500 mt-3">Showing {filtered.length} of {groups.length}</p>

      {/* Content */}
      <div className="mt-3">
        {loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : view === "list" ? (
          <div className="space-y-4">
            {filtered.map((g) => (
              <GroupRow key={g._id} group={g} currentUser={currentUser} onJoin={handleJoin} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((g) => (
              <GroupCard key={g._id} group={g} currentUser={currentUser} onJoin={handleJoin} />
            ))}
          </div>
        )}
      </div>

      {/* Floating create button */}
      <Link
        to="/groupCreation"
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        aria-label="Create group"
      >
        <FiPlus className="text-xl" />
      </Link>

      {/* Toasts */}
      {error ? (
        <Toast tone="danger" onClose={clearError}>
          {String(error)}
        </Toast>
      ) : null}
      {successMessage ? (
        <Toast tone="success" onClose={clearSuccessMessage}>
          {String(successMessage)}
        </Toast>
      ) : null}
    </div>
  );
}

// === Pieces ===

function GroupRow({ group, currentUser, onJoin }) {
  const initials = useMemo(() => toInitials(group?.name), [group?.name]);
  const activeMembers = (group?.members || []).filter((m) => m.status === "active" && m.isActive);
  const totalPool = (group?.savingsAmount || 0) * activeMembers.length;
  const progress = clampPct(group?.progress);
  const isAdmin = group?.admin?._id === currentUser?._id;
  const queue = group?.payoutOrder?.length || 0;
  const nextRecipient =
    group?.members?.find((m) => m?.user?._id === group?.nextRecipient)?.user?.email || group?.nextRecipient || "—";

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4">
        {/* Top section */}
        <div className="flex items-start gap-4 justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-semibold">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-slate-900 truncate max-w-[16rem] sm:max-w-none">{group?.name || "Unnamed Group"}</h3>
                {group?.status ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 capitalize">
                    {group.status}
                  </span>
                ) : null}
                {isAdmin && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Admin</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{activeMembers.length} Members</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-500" aria-label="More options">
              <FiMoreHorizontal />
            </button>
            <PrimaryAction group={group} currentUser={currentUser} onJoin={onJoin} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <KV label="Per Member" value={`€ ${fmtMoney(group?.savingsAmount)}`} icon={<FiUsers className="text-slate-400" />} />
          <KV label="Total Pool" value={`€ ${fmtMoney(totalPool)}`} icon={<FiGrid className="text-slate-400" />} />
          <KV label="Frequency" value={capitalize(group?.frequency) || "—"} icon={<FiCalendar className="text-slate-400" />} />
          <KV label="Queue" value={queue} icon={<FiList className="text-slate-400" />} />
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Cycle Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span className="inline-flex items-center gap-2">
            <span className="inline-grid place-items-center h-5 w-5 rounded bg-slate-100 text-slate-600">↻</span>
            Next Recipient
          </span>
          <span className="text-slate-700">{nextRecipient}</span>
        </div>
      </div>
    </div>
  );
}

function GroupCard(props) {
  // same content as GroupRow but in compact card layout
  const { group, currentUser, onJoin } = props;
  const initials = useMemo(() => toInitials(group?.name), [group?.name]);
  const activeMembers = (group?.members || []).filter((m) => m.status === "active" && m.isActive);
  const totalPool = (group?.savingsAmount || 0) * activeMembers.length;
  const progress = clampPct(group?.progress);
  const queue = group?.payoutOrder?.length || 0;
  const nextRecipient =
    group?.members?.find((m) => m?.user?._id === group?.nextRecipient)?.user?.email || group?.nextRecipient || "—";

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-sm font-semibold">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 truncate max-w-[11rem]">{group?.name || "Unnamed"}</h3>
                {group?.status ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 capitalize">
                    {group.status}
                  </span>
                ) : null}
              </div>
              <p className="text-[11px] text-slate-500">{activeMembers.length} Members</p>
            </div>
          </div>
          <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-500" aria-label="More options">
            <FiMoreHorizontal />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <KV small label="Per Member" value={`€ ${fmtMoney(group?.savingsAmount)}`} />
          <KV small label="Total Pool" value={`€ ${fmtMoney(totalPool)}`} />
          <KV small label="Frequency" value={capitalize(group?.frequency) || "—"} />
          <KV small label="Queue" value={queue} />
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span>Cycle Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>Next Recipient</span>
          <span className="text-slate-700">{nextRecipient}</span>
        </div>

        <div className="mt-3">
          <PrimaryAction group={group} currentUser={currentUser} onJoin={onJoin} full />
        </div>
      </div>
    </div>
  );
}

function PrimaryAction({ group, currentUser, onJoin, full }) {
  const membership = (group?.members || []).find((m) => m?.user?._id === currentUser?._id);

  if (membership?.status === "active" && membership?.isActive) {
    return (
      <Link
        to={`/group/${group?._id}`}
        className={`inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 ${
          full ? "w-full" : ""
        }`}
      >
        Step In
      </Link>
    );
  }
  if (membership?.status === "pending") {
    return (
      <span className={`inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg bg-slate-100 text-slate-700 border border-slate-200 ${full ? "w-full" : ""}`}>
        Pending
      </span>
    );
  }
  return (
    <button
      onClick={() => onJoin?.(group?._id)}
      className={`inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 ${
        full ? "w-full" : ""
      }`}
    >
      Join
    </button>
  );
}

function KV({ label, value, icon, small }) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-slate-50 ${small ? "p-2" : "p-3"}`}>
      <div className={`flex items-center gap-2 ${small ? "text-[10px]" : "text-xs"} text-slate-500`}>
        {icon}
        <span>{label}</span>
      </div>
      <div className={`${small ? "text-sm" : "text-base"} font-semibold text-slate-900 mt-1`}>{value}</div>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="relative inline-block">
      <select
        className="appearance-none h-10 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="capitalize">
            {opt}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
    </div>
  );
}

function Loader() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
      <div className="mx-auto h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      <p className="text-sm text-slate-600 mt-2">Loading groups…</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
      <div className="mx-auto h-16 w-16 rounded-full bg-blue-50 text-blue-600 grid place-items-center text-3xl">☺</div>
      <h3 className="text-lg font-semibold text-slate-900 mt-3">No groups found</h3>
      <p className="text-sm text-slate-500 mt-1">Create a new group or adjust your filters.</p>
      <Link to="/groupCreation" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm">
        <FiPlus /> Create Group
      </Link>
    </div>
  );
}

function Toast({ tone = "info", children, onClose }) {
  const tones = {
    info: "bg-slate-900 text-white",
    success: "bg-emerald-600 text-white",
    danger: "bg-rose-600 text-white",
  };
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg ${tones[tone]}`}>
      <div className="flex items-center gap-3">
        <span className="text-sm">{children}</span>
        <button onClick={onClose} className="text-white/80 hover:text-white text-sm">Dismiss</button>
      </div>
    </div>
  );
}

// === utils ===
function toInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("") || "FG";
}

function fmtMoney(n) {
  const num = Number(n || 0);
  return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function clampPct(p) {
  const n = Number(p || 0);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function capitalize(s) {
  if (!s) return s;
  return String(s).charAt(0).toUpperCase() + String(s).slice(1);
}
