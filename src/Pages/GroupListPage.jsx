// GroupListPage.jsx
import React, { useEffect, useState } from "react";
import {
  FiEye,
  FiPlus,
  FiUsers,
  FiClock,
  FiCalendar,
  FiTrendingUp,
  FiShield,
  FiChevronDown,
  FiChevronUp,
  FiMoreHorizontal,
} from "react-icons/fi";
import { FaEuroSign, FaCrown } from "react-icons/fa";
import { Link } from "react-router-dom";
import useGroupStore from "../Store/group";
import useAuthStore from "../Store/Auth";

/** Brand colors (3 max, no gradients) */
const COLORS = {
  darkBlue: "#003E7B",
  accentBlue: "#007BFF",
  lightNeutral: "#F4E8D0",
};

const GroupListTable = ({ titleInside = undefined }) => {
  const {
    groups = [],
    loading,
    error,
    successMessage,
    fetchUserGroups,
    clearError,
    clearSuccessMessage,
    joinGroup,
  } = useGroupStore();

  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    if (currentUser?._id) {
      fetchUserGroups();
    }
  }, [fetchUserGroups, currentUser]);

  const requestToJoinGroup = async (groupId) => {
    try {
      await joinGroup(groupId);
      alert("Join request sent successfully!");
    } catch (err) {
      console.error("Failed to send join request:", err);
    }
  };

  const AlertMessage = ({ message, type, onClose }) => (
    <div
      className={`fixed top-4 right-4 shadow-lg ${
        type === "red"
          ? `bg-[${COLORS.lightNeutral}] text-[${COLORS.darkBlue}]`
          : `bg-[${COLORS.accentBlue}] text-white`
      } px-4 py-3 rounded z-50 max-w-xs sm:max-w-md flex items-center`}
    >
      <span className="block sm:inline">{message}</span>
      <button onClick={onClose} className="ml-4 p-1" aria-label="Close">
        ✕
      </button>
    </div>
  );

  return (
    <div className="relative px-2 sm:px-4 md:pb-24">
      {/* Create Group FAB */}
      <Link
        to="/groupCreation"
        className={`fixed bottom-20 right-6 sm:bottom-24 sm:right-8 flex items-center justify-center h-12 w-12 rounded-full bg-[${COLORS.darkBlue}] text-white hover:bg-[${COLORS.accentBlue}] transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-[${COLORS.accentBlue}] focus:ring-offset-2 z-20`}
        aria-label="Create new group"
      >
        <FiPlus className="h-5 w-5" />
      </Link>

      {error && <AlertMessage message={error} type="red" onClose={clearError} />}
      {successMessage && (
        <AlertMessage message={successMessage} type="green" onClose={clearSuccessMessage} />
      )}

      {!titleInside ? (
        <div className="pt-4">
          <h1 className={`text-lg sm:text-xl font-semibold text-[${COLORS.darkBlue}]`}>
            Groups
          </h1>
          <p className={`text-xs sm:text-sm text-[${COLORS.darkBlue}] opacity-70 mt-1`}>
            {groups.length} group{groups.length !== 1 ? "s" : ""} found
          </p>
        </div>
      ) : null}

      <div className="mt-4">
        {loading ? (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm">
            <div
              className={`inline-block animate-spin rounded-full h-8 w-8 border-4 border-[${COLORS.accentBlue}] border-t-transparent`}
            ></div>
            <p className={`mt-2 text-sm text-[${COLORS.darkBlue}] opacity-70`}>Loading groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {groups.map((group) => (
              <GroupCard
                key={group._id}
                group={group}
                onJoinRequest={requestToJoinGroup}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const GroupCard = ({ group, onJoinRequest, currentUser }) => {
  const [open, setOpen] = useState({
    members: false,
    payouts: false,
    contributions: false,
    details: false,
    moreSection: false, // New state for controlling the visibility of the entire more section
  });

  const activeMembers =
    group.members?.filter((m) => m.status === "active" && m.isActive) || [];
  const pendingMembers =
    group.members?.filter((m) => m.status === "pending") || [];
  const totalMembers = activeMembers.length;
  const totalPool = (group.savingsAmount || 0) * totalMembers;

  const isUserAdmin = group.admin?._id === currentUser?._id;

  const nextRecipientEmail =
    group.members?.find((m) => m.user?._id === group.nextRecipient)?.user?.email ??
    group.nextRecipient;

  const payoutRecipientEmail = (id) =>
    group.members?.find((m) => m.user?._id === id)?.user?.email ?? id;

  const memberEmailByUserId = (id) =>
    group.members?.find((m) => m.user?._id === id)?.user?.email ?? id;

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  const fmtDateTime = (d) =>
    d
      ? new Date(d).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const calculateTimeLeft = (payoutDate) => {
    if (!payoutDate) return "N/A";
    const now = new Date();
    const payout = new Date(payoutDate);
    const diff = payout - now;
    if (diff < 0) return "Overdue";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h`;
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m`;
  };

  const progressPct = Number(group.progress || 0);

  const toggleMoreSection = () => {
    setOpen((s) => ({ ...s, moreSection: !s.moreSection }));
  };

  return (
    <div className="rounded-lg shadow-sm border border-gray-200 overflow-hidden bg-white">
      {/* Header */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 sm:mb-6 gap-4">
          <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <img
                className={`h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full object-cover border-2 border-[${COLORS.accentBlue}]`}
                src={`https://api.joinonemai.com${group.image}`}
                alt={group.name}
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${group.name}&background=random`;
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg sm:text-xl font-semibold text-[${COLORS.darkBlue}] break-words leading-tight`}>
                {group.name}
              </h3>

              {/* Status + Admin badge */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    group.status === "active"
                      ? `bg-[${COLORS.accentBlue}] text-white`
                      : `bg-[${COLORS.lightNeutral}] text-[${COLORS.darkBlue}]`
                  }`}
                >
                  {group.status}
                </span>

                {isUserAdmin && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[${COLORS.lightNeutral}] text-[${COLORS.darkBlue}]`}
                  >
                    <FaCrown className="mr-1 w-3 h-3" />
                    Admin
                  </span>
                )}
              </div>

              {/* Admin email */}
              <p className="text-xs text-gray-600 mt-2">
                Admin: <span className="font-medium">{group.admin?.email || "—"}</span>
              </p>

              {/* Short facts row */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-700">
                <div className="flex items-center gap-1">
                  <FiUsers />
                  <span>
                    {activeMembers.length}/{group.maxMembers || 0} active
                    {pendingMembers.length > 0 && (
                      <span className="ml-1">
                        ({pendingMembers.length} pending)
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FiShield />
                  <span>
                    Late payments:{" "}
                    <b>
                      {group.rules?.allowLatePayments ? "Allowed" : "Not Allowed"}
                    </b>
                    {group.rules?.allowLatePayments &&
                      group.rules?.latePaymentFee > 0 &&
                      ` • Fee: ${group.rules.latePaymentFee} €`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FiCalendar />
                  <span>Start: {fmtDate(group.startDate || group.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <GroupActions group={group} currentUser={currentUser} onJoinRequest={onJoinRequest} />
        </div>

        {/* Key stats (solid colors only) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatChip
            color={COLORS.darkBlue}
            label="Per Member"
            value={`${group.savingsAmount || 0} €`}
            icon={<FaEuroSign className="w-4 h-4" />}
          />
          <StatChip
            color={COLORS.darkBlue}
            label="Total Pool"
            value={`${totalPool} €`}
            icon={<FiTrendingUp className="w-4 h-4" />}
          />
          <StatChip
            color={COLORS.darkBlue}
            label="Invite Code"
            value={group.inviteCode || "—"}
            icon={<FiShield className="w-4 h-4" />}
          />
          <StatChip
            color={COLORS.darkBlue}
            label="Queue"
            value={group.payoutOrder?.length || 0}
            icon={<FiUsers className="w-4 h-4" />}
          />
        </div>

        {/* Progress & timing */}
        <div className="mt-4 sm:mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Cycle Progress</span>
            <span className="text-sm text-gray-600">{progressPct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-[${COLORS.darkBlue}]`}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-gray-600" />
              <span>
                Next Payout: <b>{fmtDate(group.nextPayoutDate)}</b>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FiClock className="text-gray-600" />
              <span>Time Left: <b>{calculateTimeLeft(group.nextPayoutDate)}</b></span>
            </div>
            <div className="flex items-center gap-2">
              <FiUsers className="text-gray-600" />
              <span>
                Next Recipient: <b>{nextRecipientEmail || "—"}</b>
              </span>
            </div>
          </div>

          {/* Current cycle & indices */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Frequency:</span>{" "}
              <b className="capitalize">{group.frequency || "—"}</b>
            </div>
            <div>
              <span className="text-gray-600">Current Cycle:</span>{" "}
              <b>{group.currentCycle ?? "—"}</b>
            </div>
            <div>
              <span className="text-gray-600">Payout Index:</span>{" "}
              <b>{(group.currentPayoutIndex ?? 0) + 1}</b>
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Total Contributions:</span>{" "}
              <b>{(group.totalContributions || 0)} €</b>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>{" "}
              <b className="capitalize">{group.status || "—"}</b>
            </div>
            <div>
              <span className="text-gray-600">Created:</span>{" "}
              <b>{fmtDate(group.createdAt)}</b>
            </div>
          </div>

          {/* Description (if any) */}
          {group.description ? (
            <div className="text-sm text-gray-700">
              <span className="font-medium" style={{ color: COLORS.darkBlue }}>
                Description:
              </span>{" "}
              {group.description}
            </div>
          ) : null}
        </div>

        {/* More Section Toggle Button */}
        <div className="mt-5">
          <button
            type="button"
            onClick={toggleMoreSection}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-[${COLORS.darkBlue}] hover:text-[${COLORS.accentBlue}] border border-gray-200 rounded-lg hover:border-[${COLORS.accentBlue}] transition-colors`}
          >
            <FiMoreHorizontal className="w-4 h-4" />
            <span>More Details</span>
            {open.moreSection ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Collapsible More Section */}
        {open.moreSection && (
          <div className="mt-4 space-y-3">
            {/* Members */}
            <Collapse
              title={`Members (${group.members?.length || 0})`}
              open={open.members}
              onToggle={() => setOpen((s) => ({ ...s, members: !s.members }))}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className={`bg-[${COLORS.lightNeutral}]`}>
                    <tr className="text-left">
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Active</th>
                      <th className="px-3 py-2">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.members?.map((m) => (
                      <tr key={m._id} className="border-b last:border-0">
                        <td className="px-3 py-2">{m.user?.email}</td>
                        <td className="px-3 py-2 capitalize">{m.status}</td>
                        <td className="px-3 py-2">{m.isActive ? "Yes" : "No"}</td>
                        <td className="px-3 py-2">{fmtDateTime(m.joinedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Collapse>

            {/* Payouts */}
            <Collapse
              title={`Payouts (${group.payouts?.length || 0})`}
              open={open.payouts}
              onToggle={() => setOpen((s) => ({ ...s, payouts: !s.payouts }))}
            >
              {(!group.payouts || group.payouts.length === 0) ? (
                <p className="text-sm text-gray-600">No payouts yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className={`bg-[${COLORS.lightNeutral}]`}>
                      <tr className="text-left">
                        <th className="px-3 py-2">Recipient</th>
                        <th className="px-3 py-2">Amount</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Transaction ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.payouts.map((p) => (
                        <tr key={p._id} className="border-b last:border-0">
                          <td className="px-3 py-2">{payoutRecipientEmail(p.recipient)}</td>
                          <td className="px-3 py-2">{p.amount} €</td>
                          <td className="px-3 py-2">{fmtDateTime(p.date)}</td>
                          <td className="px-3 py-2 capitalize">{p.status}</td>
                          <td className="px-3 py-2">{p.transactionId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Collapse>

            {/* Contributions */}
            <Collapse
              title={`Contributions (${group.contributions?.length || 0})`}
              open={open.contributions}
              onToggle={() => setOpen((s) => ({ ...s, contributions: !s.contributions }))}
            >
              {(!group.contributions || group.contributions.length === 0) ? (
                <p className="text-sm text-gray-600">No contributions yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className={`bg-[${COLORS.lightNeutral}]`}>
                      <tr className="text-left">
                        <th className="px-3 py-2">User</th>
                        <th className="px-3 py-2">Amount</th>
                        <th className="px-3 py-2">Method</th>
                        <th className="px-3 py-2">Verified</th>
                        <th className="px-3 py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.contributions.map((c) => (
                        <tr key={c._id} className="border-b last:border-0">
                          <td className="px-3 py-2">{memberEmailByUserId(c.user)}</td>
                          <td className="px-3 py-2">{c.amount} €</td>
                          <td className="px-3 py-2 uppercase">{c.paymentMethod}</td>
                          <td className="px-3 py-2">{c.verified ? "Yes" : "No"}</td>
                          <td className="px-3 py-2">{fmtDateTime(c.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Collapse>

            {/* Details */}
            <Collapse
              title="Details"
              open={open.details}
              onToggle={() => setOpen((s) => ({ ...s, details: !s.details }))}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">ID:</span> <b>{group._id}</b>
                </div>
                <div>
                  <span className="text-gray-600">Updated:</span> <b>{fmtDateTime(group.updatedAt)}</b>
                </div>
                <div>
                  <span className="text-gray-600">Invite Code:</span>{" "}
                  <b>{group.inviteCode || "—"}</b>
                </div>
                <div>
                  <span className="text-gray-600">Time Left (raw):</span>{" "}
                  <b>{group.timeLeft ?? "—"}</b>
                </div>
                <div>
                  <span className="text-gray-600">Payout Order:</span>{" "}
                  <b>{(group.payoutOrder || []).join(", ") || "—"}</b>
                </div>
                <div>
                  <span className="text-gray-600">Version:</span>{" "}
                  <b>{group.__v ?? "—"}</b>
                </div>
              </div>
            </Collapse>
          </div>
        )}
      </div>
    </div>
  );
};

const StatChip = ({ color, label, value, icon }) => (
  <div className="p-3 rounded-lg text-white" style={{ backgroundColor: color }}>
    <div className="flex items-center gap-2 text-xs opacity-90">
      {icon}
      <span>{label}</span>
    </div>
    <p className="text-base sm:text-lg font-bold mt-1">{value}</p>
  </div>
);

const Collapse = ({ title, open, onToggle, children }) => (
  <div className="border border-gray-200 rounded-lg">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-2 text-left"
      style={{ color: COLORS.darkBlue }}
    >
      <span className="font-medium">{title}</span>
      {open ? <FiChevronUp /> : <FiChevronDown />}
    </button>
    {open && <div className="px-3 pb-3">{children}</div>}
  </div>
);

const GroupActions = ({ group, onJoinRequest, currentUser }) => {
  const userMembership = group.members?.find(
    (m) => m.user?._id === currentUser?._id
  );

  if (userMembership?.status === "active" && userMembership?.isActive) {
    return (
      <Link
        to={`/group/${group._id}`}
        className={`inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-[${COLORS.darkBlue}] hover:bg-[${COLORS.accentBlue}] rounded-lg transition-colors whitespace-nowrap`}
      >
        <FiEye className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" /> Step In
      </Link>
    );
  }

  if (userMembership?.status === "pending") {
    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-[${COLORS.darkBlue}] bg-[${COLORS.lightNeutral}] rounded-lg whitespace-nowrap`}
      >
        <FiClock className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" /> Pending
      </span>
    );
  }

  return (
    <button
      onClick={() => onJoinRequest(group._id)}
      className={`inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-[${COLORS.accentBlue}] hover:text-white hover:bg-[${COLORS.accentBlue}] border border-[${COLORS.accentBlue}] rounded-lg transition-colors whitespace-nowrap`}
    >
      <FiPlus className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" /> Join
    </button>
  );
};

const EmptyState = () => (
  <div className="text-center py-8 sm:py-16 bg-white rounded-lg shadow-sm">
    <div className={`mx-auto h-16 w-16 sm:h-24 sm:w-24 text-[${COLORS.accentBlue}] mb-3 sm:mb-4`}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </div>
    <h3 className={`text-lg sm:text-xl font-semibold text-[${COLORS.darkBlue}] mb-2`}>No groups found</h3>
    <p className={`text-sm text-[${COLORS.darkBlue}] opacity-70 mb-4 sm:mb-6 max-w-md mx-auto`}>
      Get started by creating your first savings group or joining an existing one.
    </p>
    <Link
      to="/groupCreation"
      className={`inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-medium text-white bg-[${COLORS.accentBlue}] hover:bg-[${COLORS.darkBlue}] rounded-lg transition-colors`}
    >
      <FiPlus className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
      Create Group
    </Link>
  </div>
);

export default GroupListTable;