// GroupListPage.jsx
import React, { useEffect } from "react";
import { FiEye, FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";
import useGroupStore from "../Store/group";
import useAuthStore from "../Store/Auth";

const GroupListTable = ({ titleInside = undefined }) => {
  const {
    groups = [],
    loading,
    error,
    successMessage,
    fetchUserGroups,
    clearError,
    clearSuccessMessage,
    getGroupDetails,
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
    } catch (error) {
      console.error("Failed to send join request:", error);
    }
  };

  const AlertMessage = ({ message, type, onClose }) => (
    <div
      className={`fixed top-4 right-4 bg-${type}-100 border border-${type}-400 text-${type}-700 px-4 py-3 rounded z-50 max-w-xs sm:max-w-md`}
    >
      <span className="block sm:inline">{message}</span>
      <button
        onClick={onClose}
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
      >
        <svg
          className={`fill-current h-6 w-6 text-${type}-500`}
          role="button"
          viewBox="0 0 20 20"
        >
          <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 relative dark:bg-gray-900 px-2 sm:px-4 pb-24">
      <Link
        to="/groupCreation"
        className="fixed bottom-20 right-6 sm:bottom-24 sm:right-8 flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-blue-100 text-white hover:bg-blue-700 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-20"
        aria-label="Create new group"
      >
        <FiPlus className="h-5 w-5 sm:h-6 sm:w-6" />
      </Link>

      {error && <AlertMessage message={error} type="red" onClose={clearError} />}
      {successMessage && (
        <AlertMessage message={successMessage} type="green" onClose={clearSuccessMessage} />
      )}

      {!titleInside ? (
        <div className="pt-4">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
            Groups
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {groups.length} group{groups.length !== 1 ? "s" : ""} found
          </p>
        </div>
      ) : null}

      <div className="mt-4 bg-white rounded-lg shadow-sm overflow-hidden">
        {titleInside && (
          <div className="px-4 pt-4 -mb-6">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
              Recent Groups
            </h1>
          </div>
        )}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">Loading groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto pt-12 px-2 sm:px-6 pb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="rounded-xl">
                  <TableHeader>Group Name</TableHeader>
                  <TableHeader>Members</TableHeader>
                  <TableHeader className="hidden sm:table-cell">Time Left</TableHeader>
                  <TableHeader className="hidden sm:table-cell">Progress</TableHeader>
                  {!titleInside && <TableHeader align="right">Action</TableHeader>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groups.map((group) => (
                  <TableRow
                    key={group._id}
                    group={group}
                    onJoinRequest={requestToJoinGroup}
                    currentUser={currentUser}
                    getGroupDetails={getGroupDetails}
                    titleInside={titleInside}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const TableHeader = ({ children, align = "left", className = "" }) => (
  <th
    scope="col"
    className={`px-4 py-2 sm:px-6 sm:py-3 text-${align} text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);

const TableRow = ({
  group,
  onJoinRequest,
  currentUser,
  getGroupDetails,
  titleInside,
}) => {
  const activeMembers =
    group.members?.filter(
      (member) => member.status === "active" && member.isActive
    ) || [];
  const totalMembers = activeMembers.length;
  const progress = Math.round(
    ((group.currentPayoutIndex || 0) / (totalMembers || 1)) * 100
  );

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={`https://api.joinonemai.com${group.image}`}
              alt={group.name}
            />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
              {group.name}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              ${group.savingsAmount * totalMembers}
            </div>
            {group.admin?._id === currentUser?._id && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                Admin
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900">
        {totalMembers}/{group.maxMembers || 15}
      </td>
      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {calculateTimeLeft(group.nextPayoutDate)}
        </span>
      </td>
      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
        <ProgressBar progress={progress} />
      </td>
      {!titleInside && (
        <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
          <GroupActions
            group={group}
            onJoinRequest={onJoinRequest}
            currentUser={currentUser}
            getGroupDetails={getGroupDetails}
          />
        </td>
      )}
    </tr>
  );
};

const ProgressBar = ({ progress }) => (
  <div className="flex items-center">
    <div className="w-24 sm:w-32 mr-2">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-100 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
    <span className="text-xs sm:text-sm font-medium text-gray-700">{progress}%</span>
  </div>
);

const GroupActions = ({ group, onJoinRequest, currentUser }) => {
  const userMembership = group.members?.find(
    (member) => member.user?._id === currentUser?._id
  );

  if (userMembership?.status === "active" && userMembership?.isActive) {
    return (
      <Link
        to={`/group/${group._id}`}
        className="inline-flex items-center text-[#3390d5] hover:text-blue-900 text-xs sm:text-sm"
      >
        <FiEye className="mr-1" /> View
      </Link>
    );
  }

  if (userMembership?.status === "pending") {
    return (
      <span className="inline-flex items-center text-gray-500 cursor-not-allowed text-xs sm:text-sm">
        <FiPlus className="mr-1" /> Pending
      </span>
    );
  }

  return (
    <button
      onClick={() => onJoinRequest(group._id)}
      className="inline-flex items-center text-[#3390d5] hover:text-blue-900 text-xs sm:text-sm"
    >
      <FiPlus className="mr-1" /> Join
    </button>
  );
};

const EmptyState = () => (
  <div className="text-center py-8 sm:py-12">
    <div className="mx-auto h-20 w-20 sm:h-24 sm:w-24 text-gray-400">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2"
        />
      </svg>
    </div>
    <h3 className="mt-2 text-sm font-semibold text-gray-900">No groups found</h3>
    <p className="mt-1 text-xs sm:text-sm text-gray-500">
      Create or join a group to get started.
    </p>
  </div>
);

const calculateTimeLeft = (payoutDate) => {
  if (!payoutDate) return "N/A";
  const now = new Date();
  const payout = new Date(payoutDate);
  const diff = payout - now;
  if (diff < 0) return "Completed";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days} day${days !== 1 ? "s" : ""}`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  return `${hours} hour${hours !== 1 ? "s" : ""}`;
};

export default GroupListTable;
