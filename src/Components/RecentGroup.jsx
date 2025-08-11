// GroupListPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiExternalLink,
  FiMoreVertical,
  FiUsers,
  FiAward,
} from "react-icons/fi";
import useGroupStore from "../Store/group";
import useAuthStore from "../Store/Auth";

const GroupListTable = () => {
  const { groups = [], loading, error, fetchUserGroups } = useGroupStore();
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(null); // Track open menu

  useEffect(() => {
    if (currentUser?._id) fetchUserGroups();
  }, [fetchUserGroups, currentUser]);

  const initials = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => (s[0] || "").toUpperCase())
      .join("");

  const isAdmin = (g) => g?.admin?._id === currentUser?._id;

  const membersCount = (g) => g?.members?.length ?? 0;

  const percent = (g) => {
    const p = Number(g?.progress ?? 10);
    return Math.max(0, Math.min(100, isNaN(p) ? 10 : p));
  };

  const nextRecipient = (g) =>
    g?.nextRecipient?.username ||
    g?.nextRecipient?.handle ||
    g?.nextRecipient ||
    "edimark357";

  const handleStepIn = (groupId) => {
    setMenuOpen(null); // close menu
    navigate(`/group/${groupId}`);
  };

  return (
    <section className="w-full relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Investment Groups
        </h2>
        <Link
          to="/groupList"
          className="text-sm text-blue-500 hover:text-blue-600 inline-flex items-center"
        >
          View All <FiExternalLink className="ml-1" />
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-3 py-2">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && groups.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-gray-500">
          No groups yet.
        </div>
      )}

      {/* Cards */}
      {!loading && groups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {groups.map((g) => (
            <div
              key={g._id || g.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative"
            >
              {/* Top row */}
              <div className="p-5 flex items-start justify-between">
                <div className="flex items-start">
                  <div className="w-12 h-12 mr-3 rounded-xl bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {initials(g?.name)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-semibold text-gray-900">
                        {g?.name || "Group Name"}
                      </h4>
                      {isAdmin(g) && (
                        <span className="inline-flex items-center px-2 py-0.5 text-[11px] rounded-full border border-orange-300 bg-orange-50 text-orange-600">
                          <FiAward className="mr-1" /> Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {membersCount(g)} Members
                    </p>
                  </div>
                </div>

                {/* More icon */}
                <div className="relative">
                  <button
                    type="button"
                    aria-label="More"
                    onClick={() =>
                      setMenuOpen(menuOpen === g._id ? null : g._id)
                    }
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <FiMoreVertical />
                  </button>

                  {/* Dropdown menu */}
                  {menuOpen === g._id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                      <button
                        onClick={() => handleStepIn(g._id)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Step In
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="px-5 pb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-800">
                    Cycle Progress
                  </p>
                  <p className="text-sm text-gray-500">{percent(g)}%</p>
                </div>
                <div className="w-full h-2.5 rounded-full bg-gray-200">
                  <div
                    className="h-2.5 rounded-full bg-gray-800"
                    style={{ width: `${percent(g)}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between rounded-b-2xl">
                <div className="flex items-center text-sm text-gray-600">
                  <FiUsers className="mr-2" />
                  <span>Next Recipient</span>
                </div>
                <span className="text-sm text-gray-700">{nextRecipient(g)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default GroupListTable;
