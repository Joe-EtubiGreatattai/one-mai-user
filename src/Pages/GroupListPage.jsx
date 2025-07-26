// GroupListPage.jsx
import React, { useEffect } from "react";
import { FiEye, FiPlus, FiUsers, FiDollarSign, FiClock, FiCalendar, FiTrendingUp, FiShield } from "react-icons/fi";
import { FaCrown } from "react-icons/fa";
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
      className={`fixed top-4 right-4 bg-${type}-100 border border-${type}-400 text-${type}-700 px-4 py-3 rounded z-50 max-w-xs sm:max-w-md flex items-center`}
    >
      <span className="block sm:inline">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 p-1"
        aria-label="Close"
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
    <div className="bg-gray-50 relative dark:bg-gray-900 px-2 sm:px-4 md:pb-24">
      <Link
        to="/groupCreation"
        className="fixed bottom-20 right-6 sm:bottom-24 sm:right-8 flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-[#3390d5] text-white hover:bg-[#2980c9] transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-[#3390d5] focus:ring-offset-2 z-20"
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

      <div className="mt-4">
        {titleInside && (
          <div className="mb-4">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
              Recent Groups
            </h1>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#3390d5] border-t-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">Loading groups...</p>
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
                getGroupDetails={getGroupDetails}
                titleInside={titleInside}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const GroupCard = ({ group, onJoinRequest, currentUser, getGroupDetails, titleInside }) => {
  const activeMembers = group.members?.filter(
    (member) => member.status === "active" && member.isActive
  ) || [];
  
  const pendingMembers = group.members?.filter(
    (member) => member.status === "pending"
  ) || [];
  
  const totalMembers = activeMembers.length;
  const totalPotential = group.savingsAmount * totalMembers;
  const isUserAdmin = group.admin?._id === currentUser?._id;
  const userMembership = group.members?.find(
    (member) => member.user?._id === currentUser?._id
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getNextRecipient = () => {
    const nextRecipient = group.members?.find(
      member => member.user?._id === group.nextRecipient
    );
    return nextRecipient?.user?.email?.split('@')[0] || 'Unknown';
  };

  const getGroupStats = () => {
    const inactiveMembers = group.members?.filter(
      (member) => !member.isActive || member.status === "pending"
    ) || [];
    
    return {
      activeMembers: activeMembers.length,
      inactiveMembers: inactiveMembers.length,
      totalMembers: group.members?.length || 0,
      maxMembers: group.maxMembers,
      payoutOrderLength: group.payoutOrder?.length || 0
    };
  };

  const getPaymentProgress = () => {
    if (!group.contributions || group.contributions.length === 0) return 0;
    const currentCycleContributions = group.contributions.filter(
      contrib => contrib.cycle === group.currentCycle
    );
    return Math.round((currentCycleContributions.length / totalMembers) * 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header Section */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 sm:mb-6 gap-4">
          <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <img
                className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full object-cover border-2 border-gray-100"
                src={`https://api.joinonemai.com${group.image}`}
                alt={group.name}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${group.name}&background=random`;
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 break-words leading-tight mb-2 sm:mb-3">
                {group.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                <span className={`inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
                  group.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {group.status}
                </span>
                {isUserAdmin && (
                  <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-800">
                    <FaCrown className="mr-1 w-3 h-3" />
                    Admin
                  </span>
                )}
              </div>
              
              {/* Financial Summary - Now in header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                <div className="bg-[#3390d5]/10 p-2 sm:p-3 rounded-lg">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <FiDollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-[#3390d5]" />
                    <span className="text-xs sm:text-sm font-medium text-[#3390d5]">Per Member</span>
                  </div>
                  <p className="text-base sm:text-xl font-bold text-[#2980c9]">${group.savingsAmount}</p>
                </div>
                <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <FiTrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    <span className="text-xs sm:text-sm font-medium text-green-600">Total Pool</span>
                  </div>
                  <p className="text-base sm:text-xl font-bold text-green-800">${totalPotential}</p>
                </div>
                <div className="bg-purple-50 p-2 sm:p-3 rounded-lg">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <FiShield className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                    <span className="text-xs sm:text-sm font-medium text-purple-600">Invite Code</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-purple-800 break-all">{group.inviteCode}</p>
                </div>
                <div className="bg-orange-50 p-2 sm:p-3 rounded-lg">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <FiUsers className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                    <span className="text-xs sm:text-sm font-medium text-orange-600">Payout Queue</span>
                  </div>
                  <p className="text-base sm:text-xl font-bold text-orange-800">{group.payoutOrder?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="flex-shrink-0 sm:ml-6 self-center sm:self-start">
            <GroupActions
              group={group}
              onJoinRequest={onJoinRequest}
              currentUser={currentUser}
              getGroupDetails={getGroupDetails}
              titleInside={titleInside}
            />
          </div>
        </div>

        {/* Members & Progress Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-3 sm:space-y-4">
            {/* Members Info */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <FiUsers className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                <span className="text-gray-600">Members</span>
              </div>
              <span className="font-medium text-gray-900">
                {totalMembers}/{group.maxMembers || 15}
                {pendingMembers.length > 0 && (
                  <span className="text-yellow-600 ml-1">({pendingMembers.length} pending)</span>
                )}
              </span>
            </div>

            {/* Late Payment Rules */}
            {group.rules && (
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <FiShield className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                  <span className="text-gray-600">Late Payments</span>
                </div>
                <span className={`font-medium ${group.rules.allowLatePayments ? 'text-yellow-600' : 'text-red-600'}`}>
                  {group.rules.allowLatePayments ? 'Allowed' : 'Not Allowed'}
                  {group.rules.allowLatePayments && group.rules.latePaymentFee > 0 && (
                    <span className="text-xs ml-1">(${group.rules.latePaymentFee} fee)</span>
                  )}
                </span>
              </div>
            )}

            {/* Next Payout & Recipient */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <div className="flex items-center space-x-1 text-gray-500 mb-1">
                  <FiClock className="w-3 h-3" />
                  <span>Next Payout</span>
                </div>
                <p className="font-medium text-gray-800">
                  {calculateTimeLeft(group.nextPayoutDate)}
                </p>
              </div>
              <div>
                <div className="flex items-center space-x-1 text-gray-500 mb-1">
                  <FiUsers className="w-3 h-3" />
                  <span>Next Recipient</span>
                </div>
                <p className="font-medium text-gray-800 truncate">
                  {getNextRecipient()}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* Cycle Progress */}
            <div>
              <div className="flex items-center justify-between text-xs sm:text-sm mb-1 sm:mb-2">
                <span className="text-gray-600">Cycle Progress</span>
                <span className="font-medium text-gray-900">{group.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                <div
                  className="bg-gradient-to-r from-[#3390d5] to-[#2980c9] h-2 sm:h-3 rounded-full transition-all duration-300"
                  style={{ width: `${group.progress || 0}%` }}
                />
              </div>
            </div>

            {/* Payment Progress */}
            <div>
              <div className="flex items-center justify-between text-xs sm:text-sm mb-1 sm:mb-2">
                <span className="text-gray-600">Payment Progress</span>
                <span className="font-medium text-gray-900">{getPaymentProgress()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 sm:h-3 rounded-full transition-all duration-300"
                  style={{ width: `${getPaymentProgress()}%` }}
                />
              </div>
            </div>

            {/* Group Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-gray-500">
                  <FiCalendar className="w-3 h-3" />
                  <span>Frequency:</span>
                </div>
                <span className="font-medium text-gray-700 capitalize">{group.frequency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Cycle:</span>
                <span className="font-medium text-gray-700">{group.currentCycle}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="text-center">
            <p className="text-gray-500 mb-1">Wallet</p>
            <p className="font-medium text-gray-800">${group.walletBalance || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 mb-1">Total Cont.</p>
            <p className="font-medium text-gray-800">${group.totalContributions || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 mb-1">Payouts</p>
            <p className="font-medium text-gray-800">{group.payouts?.length || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 mb-1">Payout Index</p>
            <p className="font-medium text-gray-800">{group.currentPayoutIndex + 1}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 mb-1">Created</p>
            <p className="font-medium text-gray-800">
              {new Date(group.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 mb-1">Queue</p>
            <p className="font-medium text-gray-800">{group.payoutOrder?.length || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const GroupActions = ({ group, onJoinRequest, currentUser, titleInside }) => {
  const userMembership = group.members?.find(
    (member) => member.user?._id === currentUser?._id
  );

  if (titleInside) {
    return null; // No actions in title inside mode
  }

  if (userMembership?.status === "active" && userMembership?.isActive) {
    return (
      <Link
        to={`/group/${group._id}`}
        className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-[#3390d5] hover:bg-[#2980c9] rounded-lg transition-colors whitespace-nowrap"
      >
        <FiEye className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" /> View
      </Link>
    );
  }

  if (userMembership?.status === "pending") {
    return (
      <span className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-yellow-700 bg-yellow-100 rounded-lg cursor-not-allowed whitespace-nowrap">
        <FiClock className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" /> Pending
      </span>
    );
  }

  return (
    <button
      onClick={() => onJoinRequest(group._id)}
      className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-[#3390d5] hover:text-white hover:bg-[#3390d5] border border-[#3390d5] rounded-lg transition-colors whitespace-nowrap"
    >
      <FiPlus className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" /> Join
    </button>
  );
};

const EmptyState = () => (
  <div className="text-center py-8 sm:py-16 bg-white rounded-lg shadow-sm">
    <div className="mx-auto h-16 w-16 sm:h-24 sm:w-24 text-gray-400 mb-3 sm:mb-4">
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
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    </div>
    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No groups found</h3>
    <p className="text-sm text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto">
      Get started by creating your first savings group or joining an existing one.
    </p>
    <Link
      to="/groupCreation"
      className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-medium text-white bg-[#3390d5] hover:bg-[#2980c9] rounded-lg transition-colors"
    >
      <FiPlus className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
      Create Your First Group
    </Link>
  </div>
);

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

export default GroupListTable;